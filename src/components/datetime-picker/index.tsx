import { Block, View, PickerView } from "@tarojs/components";
import Taro, { Component } from "@tarojs/taro";
// import withWeapp from '@tarojs/with-weapp'
import PropTypes from "prop-types";
import "./index.scss";

function isDef(value) {
  return value !== undefined && value !== null;
}
let currentYear = new Date().getFullYear();

let isValidDate = function isValidDate(date) {
  return isDef(date) && !isNaN(new Date(date).getTime());
};

function range(num, min, max) {
  return Math.min(Math.max(num, min), max);
}

class DatetimePicker extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pickerValue: [],
      innerValue: Date.now(),
      columns: []
    };
  }

  componentDidMount() {
    this.getRanges();
    if (this.props.value) {
      var innerValue = this.correctValue(this.props.value);
      this.setState(
        {
          innerValue: innerValue
        },
        () => {
          this.updateColumnValue(innerValue);
          this.props.input && this.props.input(innerValue);
        }
      );
    }
  }

  onCancel = () => {
    this.props.cancel && this.props.cancel();
  };

  onConfirm = () => {
    this.props.confirm && this.props.confirm(this.state.innerValue);
  };

  onChange = event => {
    var _this3 = this;

    var data = this.props;
    var pickerValue = event.detail.value;
    var values = pickerValue
      .slice(0, _this3.state.columns.length)
      .map(function(value, index) {
        return _this3.state.columns[index][value];
      });
    var value;

    if (data.type === "time") {
      value = values.join(":");
    } else {
      var year = this.getTrueValue(values[0]);
      var month = this.getTrueValue(values[1]);
      var maxDate = this.getMonthEndDay(year, month);
      var date = this.getTrueValue(values[2]);

      if (data.type === "year-month") {
        date = 1;
      }

      date = date > maxDate ? maxDate : date;
      var hour = 0;
      var minute = 0;

      if (data.type === "datetime") {
        hour = this.getTrueValue(values[3]);
        minute = this.getTrueValue(values[4]);
      }

      value = new Date(year, month - 1, date, hour, minute);
    }

    value = this.correctValue(value);
    this.setState({
      innerValue: value
    });
    this.updateColumnValue(value);
    this.props.input && this.props.input(value);
    this.props.change && this.props.change(this);
  };

  getRanges = () => {
    var _this = this;
    var data = this.props;

    if (data.type === "time") {
      return [
        {
          type: "hour",
          range: [data.minHour, data.maxHour]
        },
        {
          type: "minute",
          range: [data.minMinute, data.maxMinute]
        }
      ];
    }

    var _this$getBoundary = this.getBoundary("max", this.state.innerValue),
      maxYear = _this$getBoundary.maxYear,
      maxDate = _this$getBoundary.maxDate,
      maxMonth = _this$getBoundary.maxMonth,
      maxHour = _this$getBoundary.maxHour,
      maxMinute = _this$getBoundary.maxMinute;

    var _this$getBoundary2 = this.getBoundary("min", this.state.innerValue),
      minYear = _this$getBoundary2.minYear,
      minDate = _this$getBoundary2.minDate,
      minMonth = _this$getBoundary2.minMonth,
      minHour = _this$getBoundary2.minHour,
      minMinute = _this$getBoundary2.minMinute;

    var result = [
      {
        type: "year",
        range: [minYear, maxYear]
      },
      {
        type: "month",
        range: [minMonth, maxMonth]
      },
      {
        type: "day",
        range: [minDate, maxDate]
      },
      {
        type: "hour",
        range: [minHour, maxHour]
      },
      {
        type: "minute",
        range: [minMinute, maxMinute]
      }
    ];
    if (data.type === "date") result.splice(3, 2);
    if (data.type === "year-month") result.splice(2, 3);

    var columns = result.map(function(_ref) {
      var type = _ref.type,
        range = _ref.range;
      var values = _this.times(range[1] - range[0] + 1, function(index) {
        var value = range[0] + index;
        value = type === "year" ? "" + value : _this.pad(value);
        return value;
      });
      return values;
    });
    this.setState({
      columns: columns
    });
  };
  pad = val => {
    return ("00" + val).slice(-2);
  };
  correctValue = value => {
    var data = this.props,
      pad = this.pad; // validate value
    var isDateType = data.type !== "time";

    if (isDateType && !isValidDate(value)) {
      value = data.minDate;
    } else if (!isDateType && !value) {
      var minHour = data.minHour;
      value = pad(minHour) + ":00";
    } // time type
    if (!isDateType) {
      var _value$split = value.split(":"),
        hour = _value$split[0],
        minute = _value$split[1];

      hour = pad(range(hour, data.minHour, data.maxHour));
      minute = pad(range(minute, data.minMinute, data.maxMinute));
      return hour + ":" + minute;
    } // date type
    value = Math.max(value, data.minDate);
    value = Math.min(value, data.maxDate);
    return value;
  };
  times = (n, iteratee) => {
    if (!n) {
      console.log('times函数传入的参数 "n" 不存在');
      return [];
    }
    var index = -1;
    var result = Array(n);
    while (++index < n) {
      result[index] = iteratee(index);
    }
    return result;
  };
  getBoundary = (type, innerValue) => {
    var value = new Date(innerValue);
    var boundary = new Date(this.props[type + "Date"]);
    var year = boundary.getFullYear();
    var month = 1;
    var date = 1;
    var hour = 0;
    var minute = 0;

    if (type === "max") {
      month = 12;
      date = this.getMonthEndDay(value.getFullYear(), value.getMonth() + 1);
      hour = 23;
      minute = 59;
    }

    if (value.getFullYear() === year) {
      month = boundary.getMonth() + 1;

      if (value.getMonth() + 1 === month) {
        date = boundary.getDate();

        if (value.getDate() === date) {
          hour = boundary.getHours();

          if (value.getHours() === hour) {
            minute = boundary.getMinutes();
          }
        }
      }
    }

    return {
      [type + "Year"]: year,
      [type + "Month"]: month,
      [type + "Date"]: date,
      [type + "Hour"]: hour,
      [type + "Minute"]: minute
    };
  };
  getTrueValue = formattedValue => {
    if (!formattedValue) return;

    while (isNaN(parseInt(formattedValue, 10))) {
      formattedValue = formattedValue.slice(1);
    }

    return parseInt(formattedValue, 10);
  };
  getMonthEndDay = (year, month) => {
    return 32 - new Date(year, month - 1, 32).getDate();
  };
  getColumnValue = index => {
    return this.getValues()[index];
  };
  setColumnValue = (index, value) => {
    var data = this.state,
      pickerValue = data.pickerValue,
      columns = data.columns;
    pickerValue[index] = columns[index].indexOf(value);
    this.setState({
      pickerValue: pickerValue
    });
  };
  getColumnValues = index => {
    return this.state.columns[index];
  };
  setColumnValues = (index, values) => {
    var columns = this.state.columns;
    columns[index] = values;
    this.setState({
      columns: columns
    });
  };
  getValues = () => {
    var data = this.state,
      pickerValue = data.pickerValue,
      columns = data.columns;
    return pickerValue.map(function(value, index) {
      return columns[index][value];
    });
  };
  setValues = values => {
    var columns = this.state.columns;
    this.setState({
      pickerValue: values.map(function(value, index) {
        return columns[index].indexOf(value);
      })
    });
  };
  updateColumnValue = value => {
    var values = [];
    var pad = this.pad,
      data = this.props;
    var columns = this.state.columns;
    if (columns.length === 0) return false;

    if (data.type === "time") {
      var currentValue = value.split(":");
      values = [
        columns[0].indexOf(currentValue[0]),
        columns[1].indexOf(currentValue[1])
      ];
    } else {
      var date = new Date(value);
      values = [
        columns[0].indexOf("" + date.getFullYear()),
        columns[1].indexOf(pad(date.getMonth() + 1))
      ];

      if (data.type === "date") {
        values.push(columns[2].indexOf(pad(date.getDate())));
      }

      if (data.type === "datetime") {
        values.push(
          columns[2].indexOf(pad(date.getDate())),
          columns[3].indexOf(pad(date.getHours())),
          columns[4].indexOf(pad(date.getMinutes()))
        );
      }
    }

    this.setState({
      pickerValue: values
    });
  };

  render() {
    const {
      title,
      cancelButtonText,
      confirmButtonText,
      showToolbar,
      itemHeight,
      visibleItemCount
    } = this.props;
    const { pickerValue, columns } = this.state;

    return (
      <View className="van-picker">
        {showToolbar && (
          <View className="van-picker__toolbar van-hairline--bottom">
            <View className="van-picker__cancel" onClick={this.onCancel}>
              {cancelButtonText}
            </View>
            <View className="van-picker__title">{title}</View>
            <View className="van-picker__confirm" onClick={this.onConfirm}>
              {confirmButtonText}
            </View>
          </View>
        )}

        <PickerView
          indicatorStyle={"height: " + itemHeight + "px;"}
          style={
            "width: 100%; height: " + (itemHeight * visibleItemCount + "px")
          }
          onChange={this.onChange}
          value={pickerValue}
          className="van-picker__columns"
        >
          {columns.map((row, rowIndex) => {
            return (
              <PickerViewColumn key="rowIndex" className="van-picker-column">
                {row.map((item, index) => {
                  return (
                    <View
                      key={item}
                      style={"line-height: " + itemHeight + "px;"}
                      className={
                        "van-picker-column__item " +
                        (index === pickerValue[rowIndex]
                          ? "van-picker-column__item--selected"
                          : "")
                      }
                    >
                      {item}
                    </View>
                  );
                })}
              </PickerViewColumn>
            );
          })}
        </PickerView>
      </View>
    );
  }
}

DatetimePicker.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  title: PropTypes.string,
  loading: PropTypes.bool,
  itemHeight: PropTypes.number,
  visibleItemCount: PropTypes.number,
  confirmButtonText: PropTypes.string,
  cancelButtonText: PropTypes.string,
  type: PropTypes.string,
  showToolbar: PropTypes.bool,
  minDate: PropTypes.number,
  maxDate: PropTypes.number,
  minHour: PropTypes.number,
  maxHour: PropTypes.number,
  minMinute: PropTypes.number,
  maxMinute: PropTypes.number,
  input: PropTypes.func,
  change: PropTypes.func,
  cancle: PropTypes.func,
  confirm: PropTypes.func
};

// 为属性指定默认值:
DatetimePicker.defaultProps = {
  confirmButtonText: "确认",
  cancelButtonText: "取消",
  type: "datetime",
  // 是否显示顶部栏
  showToolbar: true,
  // 选项高度
  itemHeight: 44,
  // 可见的选项个数
  visibleItemCount: 5,
  minHour: 0,
  maxHour: 0,
  minMinute: 0,
  maxMinute: 59,
  minDate: new Date(currentYear - 10, 0, 1).getTime(),
  maxDate: new Date(currentYear + 10, 11, 31).getTime()
};

export default DatetimePicker;
