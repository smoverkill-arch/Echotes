const React = require("react");
const { View } = require("react-native");

const ZERO_INSETS = { top: 0, bottom: 0, left: 0, right: 0 };
const MOCK_FRAME = { width: 390, height: 844, x: 0, y: 0 };

const useSafeAreaInsets = () => ZERO_INSETS;
const useSafeAreaFrame = () => MOCK_FRAME;

const SafeAreaProvider = ({ children }) => React.createElement(View, { testID: "safe-area-provider" }, children);
const SafeAreaView = ({ children, style }) => React.createElement(View, { style }, children);
const SafeAreaConsumer = ({ children }) => children(ZERO_INSETS);

const SafeAreaInsetsContext = React.createContext(ZERO_INSETS);
const SafeAreaFrameContext = React.createContext(MOCK_FRAME);

module.exports = {
  useSafeAreaInsets,
  useSafeAreaFrame,
  SafeAreaProvider,
  SafeAreaView,
  SafeAreaConsumer,
  SafeAreaInsetsContext,
  SafeAreaFrameContext,
  initialWindowMetrics: { frame: MOCK_FRAME, insets: ZERO_INSETS },
};
