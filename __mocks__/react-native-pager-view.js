const React = require("react");
const { View } = require("react-native");

// Renders ALL pages so integration tests can access any testID at any time.
// Page navigation (auto-switch, swipe) is a UI concern tested separately.
const PagerView = React.forwardRef(function PagerView(
  { children, onPageSelected, initialPage = 0, testID, style },
  ref,
) {
  React.useImperativeHandle(ref, () => ({
    setPage: (nextPage) => {
      if (onPageSelected) {
        onPageSelected({ nativeEvent: { position: nextPage } });
      }
    },
  }));

  return (
    <View style={style} testID={testID}>
      {children}
    </View>
  );
});

PagerView.displayName = "PagerView";

module.exports = PagerView;
module.exports.default = PagerView;
