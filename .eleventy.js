// require 11ty serverless bundler plugin
const { EleventyServerlessBundlerPlugin } = require("@11ty/eleventy");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const getData = require('./scripts/getData.js')
require('dotenv').config();


function getTableHtml(data, title) {
    return `
    <h1>${title} Report</h1>
    <h2>Members</h2>
    <table class="styled-table">
        <thead>
            <th>Type</th>
            <th>Count</th>
            <th>Percent total</th>
            <th>Previous</th>
            <th>Percentage Change</th>
        </thead>
        <tr>
            <td>Total</td>
            <td>${data.totalMembersCount}</td>
            <td>${(data.totalMembersCount / data.totalMembersCount * 100).toFixed(2)}%</td>
            <td>${data.previousTotalMembersCount}</td>
            <td>${((data.totalMembersCount - data.previousTotalMembersCount) / data.previousTotalMembersCount * 100).toFixed(2)}%</td>
        </tr>
        <tr>
            <td>Active</td>
            <td>${data.currentActiveMemberData.activeMembersCount}</td>
            <td>${data.currentActiveMemberData.activeMembersPercentage}%</td>
            <td>${data.previousActiveMemberData.previousActiveMembersCount}</td>
            <td>${data.currentActiveMemberData.activeMembersPercentageChange}%</td>
        </tr>
        <tr>
            <td>Active Users</td>
            <td>${data.currentActiveUserMemberData.totalActiveUserMembersCount}</td>
            <td>${((data.currentActiveUserMemberData.totalActiveUserMembersCount / data.totalMembersCount) * 100).toFixed(2)}%</td>
            <td>${data.previousActiveUserMemberData.previousTotalActiveUserMembersCount}</td>
            <td>${data.currentActiveUserMemberData.activeMembersPercentageChange }%</td>
        <tr>
            <td>PCTS Members</td>
            <td>${data.currentActivePCTSMemberData.activePCTSMembersCount}</td>
            <td>${((data.currentActivePCTSMemberData.activePCTSMembersCount / data.totalMembersCount) * 100).toFixed(2)}%</td>
            <td>${data.previousActivePCTSMemberData.previousPCTSMembersCount}</td>
            <td>${data.currentActivePCTSMemberData.activeMembersPercentageChange}%</td>
        </tr>
        <tr>
            <td>New Members</td>
            <td>${data.newMembersCount}</td>
            <td>${((data.newMembersCount / data.totalMembersCount) * 100).toFixed(2)}%</td>
            <td>n/a</td>
            <td>n/a</td>
        </tr>
        <tr>
            <td>Returning Members</td>
            <td>${data.returningMembersCount}</td>
            <td>${((data.returningMembersCount / data.totalMembersCount) * 100).toFixed(2)}%</td>
            <td>n/a</td>
            <td>n/a</td>
        </tr>
        </table>

    `
}




module.exports = function(eleventyConfig) {

    // set up 11ty serverless
    eleventyConfig.addPlugin(EleventyServerlessBundlerPlugin, {
        name: "weekly", // The serverless function name from your permalink object
        functionsDir: "./netlify/functions/",
        copy: [
            'scripts/'
        ]
      });
    

    eleventyConfig.addAsyncShortcode("reportWeekly", async function(end) {
        const endDate = new Date(end)
        const start = new Date(end)
        
        start.setDate(endDate.getDate() - 7)
        
        const data = await getData(start, end)

        return getTableHtml(data, "Weekly")

    })
    eleventyConfig.addAsyncShortcode("reportMonthly", async  function(end) {
        // get start date from 30 days before end date
        const endDate = new Date(end)
        const start = new Date(`${end}`)
        
        start.setDate(endDate.getDate() - 30)

        const data = await getData(start, end)
        return getTableHtml(data, "Monthly")

    })
    eleventyConfig.addAsyncShortcode("reportQuarterly", async  function(start, end) {
     
    })
}