const fetch = require('node-fetch')

require('dotenv').config();
// require node-fetch default module
// const fetch = require("node-fetch").default;
const options = { method: 'GET', headers: { Accept: 'application/json', Authorization: `Bearer ${process.env.ORBIT_TOKEN}` } };

const orbitBase = 'https://app.orbit.love/api/v1/orbit/'


const getFigure = async (paramString) => {
    const url = `https://app.orbit.love/orbit/figures/new.json?${paramString}`
    const orbitData = await fetch(url, options);
    const orbitDataJson = await orbitData.json();
    const data = orbitDataJson.data.attributes.view_data
    return data
}


// Docs on event and context https://www.netlify.com/docs/functions/#the-handler-method
const handler = async (event) => {
  try {
  
    const data = await getFigure(event.rawQuery)
    console.log(data)

    const subject = event.queryStringParameters.name || 'World'
    return {
      statusCode: 200,
      body: JSON.stringify(data),
      // // more keys you can return:
      // headers: { "headerName": "headerValue", ... },
      // isBase64Encoded: true,
    }
  } catch (error) {
    return { statusCode: 500, body: error.toString() }
  }
}

module.exports = { handler }
