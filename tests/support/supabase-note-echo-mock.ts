type SupabaseMockResult<T = unknown> = {
  data: T | null;
  error: Error | null;
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
  | "single";

export interface SupabaseQueryCall {
  table: string;
  operation: QueryOperation;
  args: unknown[];
}

export interface SupabaseRpcCall {
  name: string;
  payload: unknown;
}

const createOkResult = <T>(data: T): SupabaseMockResult<T> => ({
  data,
  error: null,
});

const createErrorResult = (message: string): SupabaseMockResult<never> => ({
  data: null,
  error: new Error(message),
});

export const matchesNoteEchoOrFilter = (
  filter: string | null,
  row: Pick<Record<string, unknown>, "from_note_id" | "to_note_id">,
) => {
  if (!filter) {
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
  const rpcResults = new Map<string, SupabaseMockResult[]>();
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

  const nextTableResult = (table: string): SupabaseMockResult => {
    const queue = tableResults.get(table);
    const result = queue?.shift();

    if (!result) {
      return createErrorResult(`Sem resposta mockada para a tabela ${table}.`);
    }

    return result;
  };

  const nextRpcResult = (name: string): SupabaseMockResult => {
    const queue = rpcResults.get(name);
    const result = queue?.shift();

    if (!result) {
      return createErrorResult(`Sem resposta mockada para a rpc ${name}.`);
    }

    return result;
  };

  const createQueryBuilder = (table: string) => {
    const recordCall = (operation: QueryOperation, args: unknown[]) => {
      queryCalls.push({ table, operation, args });
    };

    const builder = {
      select(...args: unknown[]) {
        recordCall("select", args);
        return builder;
      },
      eq(...args: unknown[]) {
        recordCall("eq", args);
        return builder;
      },
      neq(...args: unknown[]) {
        recordCall("neq", args);
        return builder;
      },
      in(...args: unknown[]) {
        recordCall("in", args);
        return builder;
      },
      or(...args: unknown[]) {
        recordCall("or", args);
        return builder;
      },
      order(...args: unknown[]) {
        recordCall("order", args);
        return builder;
      },
      range(...args: unknown[]) {
        recordCall("range", args);
        return Promise.resolve(nextTableResult(table));
      },
      insert(...args: unknown[]) {
        recordCall("insert", args);
        return builder;
      },
      delete(...args: unknown[]) {
        recordCall("delete", args);
        return builder;
      },
      single(...args: unknown[]) {
        recordCall("single", args);
        return Promise.resolve(nextTableResult(table));
      },
      then(
        resolve: (value: SupabaseMockResult) => void,
        reject?: (reason: unknown) => void,
      ) {
        return Promise.resolve(nextTableResult(table)).then(resolve, reject);
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
        return Promise.resolve(nextRpcResult(name));
      },
    },
    queryCalls,
    rpcCalls,
    enqueueTableResult,
    enqueueRpcResult,
    ok: createOkResult,
    error: createErrorResult,
    reset() {
      tableResults.clear();
      rpcResults.clear();
      queryCalls.length = 0;
      rpcCalls.length = 0;
    },
  };
};
