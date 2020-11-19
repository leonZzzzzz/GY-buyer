import Taro from '@tarojs/taro'
import { View, ScrollView } from '@tarojs/components'

import './index.scss'

function QcTabsWrap(props: any): JSX.Element {

  const { tabs, current, isNum, onClickTabs } = props

  const handleClickTabs = (val: number | string): void => {
    if (val === current) return
    onClickTabs && onClickTabs(val)
  }

  return tabs.length > 5 ? (
    <ScrollView scrollX className="tabs-scroll-wrap">
      {tabs.map((item: any) => {
        return (
          <View
            key={item.id}
            className={`scroll-item ${current === item.id ? 'active' : ''}`}
            onClick={() => handleClickTabs(item.id)}
          >
            {item.title ? item.title : item.name}{isNum ? `(${item.num})` : ''}
          </View>
        )
      })}
    </ScrollView>
  ) : (
      <View className="tabs-wrap">
        {tabs.map((item: any) => {
          return (
            <View
              key={item.id}
              className={`item ${current === item.id ? 'active' : ''}`}
              onClick={() => handleClickTabs(item.id)}
            >
              {item.title ? item.title : item.name}{isNum ? `(${item.num})` : ''}
            </View>
          )
        })}
      </View>
    )
}

QcTabsWrap.defaultProps = {
  tabs: [],
  current: 0,
  isNum: false,
}

export default QcTabsWrap
















