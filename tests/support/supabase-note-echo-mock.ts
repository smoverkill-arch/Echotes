type SupabaseMockResult<T = unknown> = {
  data: T | null;
  error:
    | (Error & { code?: string; status?: number })
    | ({ message?: string; code?: string; status?: number } & Record<
        string,
        unknown
      >)
    | null;
};

type QueryOperation =
  | "delete"
  | "eq"
  | "in"
  | "insert"
  | "neq"
  | "order"
  | "or"
  | "range"
  | "select"
  | "single"
  | "update";

export interface SupabaseQueryCall {
  table: string;
  operation: QueryOperation;
  args: unknown[];
}

export interface SupabaseRpcCall {
  name: string;
  payload: unknown;
}

type TableRow = Record<string, unknown>;

interface QueryState {
  kind: "select" | "insert" | "delete" | "update";
  eqFilters: [string, unknown][];
  neqFilters: [string, unknown][];
  inFilters: [string, unknown[]][];
  orders: [string, boolean][];
  orFilter: string | null;
  rangeBounds: [number, number] | null;
  insertPayload: unknown;
  updatePayload: unknown;
}

type InsertHandler = (payload: TableRow, rows: TableRow[]) => TableRow;
type RpcHandler = (
  payload: unknown,
) => SupabaseMockResult | Promise<SupabaseMockResult>;

const createOkResult = <T>(data: T): SupabaseMockResult<T> => ({
  data,
  error: null,
});

const createErrorResult = (
  message: string,
  fields: { code?: string; status?: number } = {},
): SupabaseMockResult<never> => {
  const error = Object.assign(new Error(message), fields);

  return {
    data: null,
    error,
  };
};

const createPlainErrorResult = (
  message: string,
  fields: { code?: string; status?: number } = {},
): SupabaseMockResult<never> => ({
  data: null,
  error: { message, ...fields },
});

const splitTopLevelClauses = (filter: string) => {
  const clauses: string[] = [];
  let depth = 0;
  let current = "";

  for (const char of filter) {
    if (char === "," && depth === 0) {
      clauses.push(current);
      current = "";
      continue;
    }

    if (char === "(") {
      depth += 1;
    }

    if (char === ")") {
      depth -= 1;
    }

    current += char;
  }

  if (current.length > 0) {
    clauses.push(current);
  }

  return clauses;
};

const matchesFilterClause = (clause: string, row: TableRow): boolean => {
  if (clause.startsWith("and(") && clause.endsWith(")")) {
    return splitTopLevelClauses(clause.slice(4, -1)).every((part) =>
      matchesFilterClause(part, row),
    );
  }

  const match = clause.match(/^([a-z_]+)\.(eq|lt)\.(.+)$/);

  if (!match) {
    return false;
  }

  const [, field, operator, rawValue] = match;
  const value = String(row[field] ?? "");

  if (operator === "eq") {
    return value === rawValue;
  }

  return value < rawValue;
};

export const matchesNoteEchoOrFilter = (
  filter: string | null,
  row: TableRow,
) => {
  if (!filter) {
    return true;
  }

  if (
    splitTopLevelClauses(filter).some((clause) =>
      matchesFilterClause(clause, row),
    )
  ) {
    return true;
  }

  const exactPairs = Array.from(
    filter.matchAll(
      /from_note_id\.eq\.([a-f0-9-]{36}),to_note_id\.eq\.([a-f0-9-]{36})/g,
    ),
  ).map((match) => [match[1], match[2]]);

  if (exactPairs.length > 0) {
    return exactPairs.some(
      ([fromNoteId, toNoteId]) =>
        row.from_note_id === fromNoteId && row.to_note_id === toNoteId,
    );
  }

  const noteIds = Array.from(filter.matchAll(/[a-f0-9-]{36}/g)).map(
    (match) => match[0],
  );

  if (noteIds.length === 0) {
    return true;
  }

  return (
    noteIds.includes(String(row.from_note_id)) ||
    noteIds.includes(String(row.to_note_id))
  );
};

export const createSupabaseNoteEchoMock = () => {
  const tableResults = new Map<string, SupabaseMockResult[]>();
  const tableRows = new Map<string, TableRow[]>();
  const rpcResults = new Map<string, SupabaseMockResult[]>();
  const insertHandlers = new Map<string, InsertHandler>();
  const rpcHandlers = new Map<string, RpcHandler>();
  const queryCalls: SupabaseQueryCall[] = [];
  const rpcCalls: SupabaseRpcCall[] = [];

  const enqueueTableResult = <T>(
    table: string,
    result: SupabaseMockResult<T>,
  ) => {
    const queue = tableResults.get(table) ?? [];
    queue.push(result as SupabaseMockResult);
    tableResults.set(table, queue);
  };

  const enqueueRpcResult = <T>(name: string, result: SupabaseMockResult<T>) => {
    const queue = rpcResults.get(name) ?? [];
    queue.push(result as SupabaseMockResult);
    rpcResults.set(name, queue);
  };

  const sortRows = (rows: TableRow[], state: QueryState) => {
    if (state.orders.length === 0) {
      return rows;
    }

    return [...rows].sort((left, right) => {
      for (const [field, ascending] of state.orders) {
        const leftValue = String(left[field] ?? "");
        const rightValue = String(right[field] ?? "");
        const compare = leftValue.localeCompare(rightValue);

        if (compare !== 0) {
          return ascending ? compare : -compare;
        }
      }

      return 0;
    });
  };

  const applyRange = (rows: TableRow[], state: QueryState) => {
    if (!state.rangeBounds) {
      return rows;
    }

    const [from, to] = state.rangeBounds;

    return rows.slice(from, to + 1);
  };

  const filterRows = (rows: TableRow[], state: QueryState) =>
    applyRange(
      sortRows(
        rows
          .filter((row) =>
            state.eqFilters.every(([field, value]) => row[field] === value),
          )
          .filter((row) =>
            state.neqFilters.every(([field, value]) => row[field] !== value),
          )
          .filter((row) =>
            state.inFilters.every(
              ([field, values]) =>
                values.length === 0 || values.includes(row[field]),
            ),
          )
          .filter((row) => matchesNoteEchoOrFilter(state.orFilter, row)),
        state,
      ),
      state,
    );

  const createStatefulTableResult = (
    table: string,
    state: QueryState,
  ): SupabaseMockResult => {
    const rows = tableRows.get(table);

    if (!rows) {
      return createErrorResult(`Sem resposta mockada para a tabela ${table}.`);
    }

    if (state.kind === "insert") {
      const payloadRows = Array.isArray(state.insertPayload)
        ? state.insertPayload
        : [state.insertPayload];
      const insertHandler = insertHandlers.get(table);
      const insertedRows = payloadRows.filter(
        (row): row is TableRow => typeof row === "object" && row !== null,
      ).map((row) =>
        insertHandler
          ? insertHandler({ ...row }, rows)
          : ({ ...row } as TableRow),
      );

      rows.push(...insertedRows);

      return createOkResult(
        insertedRows.length === 1 ? insertedRows[0] : insertedRows,
      );
    }

    const matchedRows = filterRows(rows, state);

    if (state.kind === "delete") {
      const matchedSet = new Set(matchedRows);
      tableRows.set(
        table,
        rows.filter((row) => !matchedSet.has(row)),
      );
    }

    if (state.kind === "update") {
      const updatePayload =
        typeof state.updatePayload === "object" && state.updatePayload !== null
          ? (state.updatePayload as TableRow)
          : {};

      for (const row of matchedRows) {
        Object.assign(row, updatePayload);
      }
    }

    return createOkResult([...matchedRows]);
  };

  const nextTableResult = (
    table: string,
    state: QueryState,
  ): SupabaseMockResult => {
    const queue = tableResults.get(table);
    const result = queue?.shift();

    if (!result) {
      return createStatefulTableResult(table, state);
    }

    return result;
  };

  const nextRpcResult = async (
    name: string,
    payload: unknown,
  ): Promise<SupabaseMockResult> => {
    const handler = rpcHandlers.get(name);

    if (handler) {
      return handler(payload);
    }

    const queue = rpcResults.get(name);
    const result = queue?.shift();

    if (!result) {
      return createErrorResult(`Sem resposta mockada para a rpc ${name}.`);
    }

    return result;
  };

  const createQueryBuilder = (table: string) => {
    const state: QueryState = {
      kind: "select",
      eqFilters: [],
      neqFilters: [],
      inFilters: [],
      orders: [],
      orFilter: null,
      rangeBounds: null,
      insertPayload: null,
      updatePayload: null,
    };
    const recordCall = (operation: QueryOperation, args: unknown[]) => {
      queryCalls.push({ table, operation, args });
    };

    const builder = {
      select(...args: unknown[]) {
        recordCall("select", args);
        return builder;
      },
      eq(...args: unknown[]) {
        state.eqFilters.push([String(args[0]), args[1]]);
        recordCall("eq", args);
        return builder;
      },
      neq(...args: unknown[]) {
        state.neqFilters.push([String(args[0]), args[1]]);
        recordCall("neq", args);
        return builder;
      },
      in(...args: unknown[]) {
        state.inFilters.push([
          String(args[0]),
          Array.isArray(args[1]) ? args[1] : [],
        ]);
        recordCall("in", args);
        return builder;
      },
      or(...args: unknown[]) {
        state.orFilter = typeof args[0] === "string" ? args[0] : null;
        recordCall("or", args);
        return builder;
      },
      order(...args: unknown[]) {
        const options = args[1] as { ascending?: boolean } | undefined;
        state.orders.push([String(args[0]), options?.ascending !== false]);
        recordCall("order", args);
        return builder;
      },
      range(...args: unknown[]) {
        state.rangeBounds = [
          Number.isFinite(Number(args[0])) ? Number(args[0]) : 0,
          Number.isFinite(Number(args[1])) ? Number(args[1]) : 0,
        ];
        recordCall("range", args);
        return Promise.resolve(nextTableResult(table, state));
      },
      insert(...args: unknown[]) {
        state.kind = "insert";
        state.insertPayload = args[0];
        recordCall("insert", args);
        return builder;
      },
      delete(...args: unknown[]) {
        state.kind = "delete";
        recordCall("delete", args);
        return builder;
      },
      update(...args: unknown[]) {
        state.kind = "update";
        state.updatePayload = args[0];
        recordCall("update", args);
        return builder;
      },
      single(...args: unknown[]) {
        recordCall("single", args);
        const result = nextTableResult(table, state);
        const data = Array.isArray(result.data)
          ? (result.data[0] ?? null)
          : result.data;

        return Promise.resolve({ ...result, data });
      },
      then(
        resolve: (value: SupabaseMockResult) => void,
        reject?: (reason: unknown) => void,
      ) {
        return Promise.resolve(nextTableResult(table, state)).then(
          resolve,
          reject,
        );
      },
    };

    return builder;
  };

  return {
    client: {
      from(table: string) {
        return createQueryBuilder(table);
      },
      rpc(name: string, payload?: unknown) {
        rpcCalls.push({ name, payload });
        return Promise.resolve(nextRpcResult(name, payload));
      },
    },
    queryCalls,
    rpcCalls,
    setTableRows(table: string, rows: object[]) {
      tableRows.set(
        table,
        rows.map((row) => ({ ...row }) as TableRow),
      );
    },
    getTableRows(table: string) {
      return [...(tableRows.get(table) ?? [])];
    },
    enqueueTableResult,
    enqueueRpcResult,
    setInsertHandler(table: string, handler: InsertHandler) {
      insertHandlers.set(table, handler);
    },
    setRpcHandler(name: string, handler: RpcHandler) {
      rpcHandlers.set(name, handler);
    },
    ok: createOkResult,
    error: createErrorResult,
    plainError: createPlainErrorResult,
    reset() {
      tableResults.clear();
      tableRows.clear();
      rpcResults.clear();
      insertHandlers.clear();
      rpcHandlers.clear();
      queryCalls.length = 0;
      rpcCalls.length = 0;
    },
  };
};
