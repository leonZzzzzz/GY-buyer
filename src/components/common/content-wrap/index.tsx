import { View } from '@tarojs/components'
import './index.scss'

// import { useEffect } from "@tarojs/taro"

import ParserRichText from '../../parserRichText/parserRichText'

function ContentWrap(props: any): JSX.Element {
  console.log(props)
  let { title, content, background } = props

  return (
    <View className={`content-wrap ${background ? 'white' : ''}`}>
      {title && <View className="title">{title}</View>}

      <View className="content">
        {/* <wxparser richText={content} /> */}
        <ParserRichText html={content} show-with-animation animation-duration="500" selectable />
      </View>
    </View>
  )
}

ContentWrap.defaultProps = {
  title: '',
  content: '',
  background: true,
}

// ContentWrap.config = {
//   usingComponents: {
//     'wxparser': 'plugin://wxparserPlugin/wxparser'
//   }
// }

export default ContentWrap