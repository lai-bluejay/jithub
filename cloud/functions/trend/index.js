const cache = require('memory-cache')

const { fetchRepositories, fetchDevelopers } = require('./fetch')
// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()

// 

// 云函数入口函数

// 重写

exports.main = async (event, context) => {
  const { type, language, since } = event
  let res = null;
  let date = new Date()
  if (type === 'repositories') {
    const fetchFunc = fetchRepositories
  }  else if (type === 'developers') {
    const fetchFunc = fetchDevelopers
  }
 
  const cacheKey = `${type}::${language || 'nolang'}::${since ||
  'daily'}`;
  const cacheData = await db.collection(type).where({
    cacheKey: cacheKey
  }).orderBy('cacheDate', 'desc').get()
  console.log('cacheData', cacheData)
  // 两小时更新一次
  if (cacheData.data.length !== 0 &&
    ((date.getTime() - cacheData.data[0].cacheDate)  < 2 * 60 * 60 * 1000)) {
    res = JSON.parse(cacheData.data[0].content)
  } else {
    res = await fetchFunc({ language, since });
    await db.collection(type).add({
      data: {
        cacheDate: date.getTime(),
        cacheKey: cacheKey,
        content: JSON.stringify(res)
      }
    })
  }

  return {
    data: res
  }
}
