const fetch = require('node-fetch')

require('dotenv').config();
// require node-fetch default module
// const fetch = require("node-fetch").default;
const options = { method: 'GET', headers: { Accept: 'application/json', Authorization: `Bearer ${process.env.ORBIT_TOKEN}` } };

const orbitBase = 'https://app.orbit.love/api/v1/orbit/'


const getFigure = async (paramString) => {
    const url = `https://app.orbit.love/orbit/figures/new.json${paramString}`
    const orbitData = await fetch(url, options);
    const orbitDataJson = await orbitData.json();
    const data = orbitDataJson.data.attributes.view_data
    return data
}

const getData = async (endpoint, startDate, endDate) => {
    const url = `${orbitBase}${endpoint}?start_date=${startDate}&end_date=${endDate}`

    const orbitData = await fetch(url, options);
    const orbitDataJson = await orbitData.json();

    const {overview={}, members, activities={}, timeframe} = orbitDataJson.data.attributes

    return {overview, members, activities,timeframe}

}

const addMembersReducer = (previousValue, currentValue) => previousValue + currentValue;

module.exports = async function getData(start, end) {
    const startDate = new Date(start)
    const endDate = new Date(end)
    const timeBetween = ((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

    const previousPeriod = {
        start: new Date(startDate.setDate(startDate.getDate() - timeBetween)),
        end: new Date(endDate.setDate(endDate.getDate() - timeBetween))
    }

    // Gets total members
    const totalMembers = await getFigure(`?figure_data=members&affiliation=member&cumulative=true&end_date=${end}&group_by=month&start_date=${start}`)
    const totalMembersCount = totalMembers.data[0]['Total members'];
    
    // Get Previous total members
    const previousTotalMembers = await getFigure(`?figure_data=members&affiliation=member&cumulative=true&end_date=${previousPeriod.end}&group_by=month&start_date=${previousPeriod.start}`)
    const previousTotalMembersCount = previousTotalMembers.data[0]['Total members'];

    // Gets active members for current timeframe
    const activeMembers = await getFigure(`?figure_data=members&affiliation=member&end_date=${end}&group_by=week&start_date=${start}`)
    const activeMembersCount = activeMembers
                                .data
                                .map(item => item['Active members'])
                                .reduce(addMembersReducer);
    // Gets active members for previous timeframe
    const previousActiveMembers = await getFigure(`?figure_data=members&affiliation=member&end_date=${previousPeriod.end}&group_by=week&start_date=${previousPeriod.start}`)
    const previousActiveMembersCount = previousActiveMembers
                                .data
                                .map(item => item['Active members'])
                                .reduce(addMembersReducer);
    
    // Get total active user members for given timeframe
    const totalActiveUserMembers = await getFigure(`?figure_data=members&affiliation=member&end_date=${end}&group_by=month&start_date=${start}&member_tags=User`)
    const totalActiveUserMembersCount = totalActiveUserMembers
                                .data
                                .map(item => item['Active members'])
                                .reduce(addMembersReducer);

    // Gets total active user members for previous timeframe
    const previousTotalActiveUserMembers = await getFigure(`?figure_data=members&affiliation=member&end_date=${previousPeriod.end}&group_by=month&start_date=${previousPeriod.start}&member_tags=User`)
    const previousTotalActiveUserMembersCount = previousTotalActiveUserMembers
                                .data
                                .map(item => item['Active members'])
                                .reduce(addMembersReducer);
    
    
    
    // Get active PCTS members for given timeframe
    const activePCTSMembers = await getFigure(`?figure_data=members&affiliation=member&end_date=${end}&group_by=week&start_date=${start}&member_tags=User%7CProduct`)
    const activePCTSMembersCount = activePCTSMembers
                                .data
                                .map(item => item['Active members'])
                                .reduce(addMembersReducer);
                            
    // Get new members for given timeframe
    const newMembers = await getFigure(`?figure_data=members&affiliation=member&end_date=${previousPeriod.end}&group_by=month&start_date=${previousPeriod.start}&new_returning=new`)
    const newMembersCount = newMembers
                                .data
                                .map(item => item['Active members'])
                                .reduce(addMembersReducer);

    
    const previousNewMembers = await getFigure(`?figure_data=members&affiliation=member&end_date=${previousPeriod.end}&group_by=month&start_date=${previousPeriod.start}&new_returning=new`)
    const previousNewMembersCount = previousNewMembers
                                .data
                                .map(item => item['Active members'])
                                .reduce(addMembersReducer);
    
    
    // Get returning members for given timeframe
    const returningMembers = await getFigure(`?figure_data=members&affiliation=member&end_date=${previousPeriod.end}&group_by=month&start_date=${previousPeriod.start}&new_returning=returning`)
    const returningMembersCount = returningMembers
                                .data
                                .map(item => item['Active members'])
                                .reduce(addMembersReducer);

    const previousReturningMembers = await getFigure(`?figure_data=members&affiliation=member&end_date=${previousPeriod.end}&group_by=month&start_date=${previousPeriod.start}&new_returning=returning`)
    const previousReturningMembersCount = previousReturningMembers
                                .data
                                .map(item => item['Active members'])
                                .reduce(addMembersReducer);


    // Get previous PCTS members for given timeframe
    const previousPCTSMembers = await getFigure(`?figure_data=members&affiliation=member&end_date=${previousPeriod.end}&group_by=week&start_date=${previousPeriod.start}&member_tags=User%7CProduct`)
    const previousPCTSMembersCount = previousPCTSMembers
                                .data
                                .map(item => item['Active members'])
                                .reduce(addMembersReducer);

    
    const data = {
        'daysCounted': timeBetween,
        totalMembersCount, 
        previousTotalMembersCount,
        'totalDelta': totalMembersCount - previousTotalMembersCount,
        'totalDeltaPercentage': (((totalMembersCount - previousTotalMembersCount) / previousTotalMembersCount) * 100).toFixed(2),
        'currentActiveMemberData': {
            activeMembersCount, 
            'inactiveMembersCount': totalMembersCount - activeMembersCount,
            'activeMembersPercentage': ((activeMembersCount / totalMembersCount) * 100).toFixed(2),
            'inactiveMembersPercentage': ((totalMembersCount - activeMembersCount) / totalMembersCount * 100).toFixed(2),
            'activeMembersPercentageChange': ((activeMembersCount - previousActiveMembersCount) / previousActiveMembersCount * 100).toFixed(2),

        },
        'previousActiveMemberData': {
            previousActiveMembersCount,
            'inactiveMembersPercentageChange': ((totalMembersCount - activeMembersCount) / totalMembersCount * 100).toFixed(2),

        },
        'currentActiveUserMemberData': {
            totalActiveUserMembersCount,
            'activeMembersPercentageChange': (((totalActiveUserMembersCount - previousTotalActiveUserMembersCount) / totalActiveUserMembersCount)*100).toFixed(2),

        },
        'currentActivePCTSMemberData': {
            activePCTSMembersCount,
            'activeMembersPercentageChange': (((activePCTSMembersCount - previousPCTSMembersCount) / activePCTSMembersCount)*100).toFixed(2),
            'activeMembersPercentage': ((activePCTSMembersCount / totalMembersCount) * 100).toFixed(2),
        },
        'previousActivePCTSMemberData': {
            previousPCTSMembersCount,
            'activeMembersPercentage': ((activePCTSMembersCount / totalMembersCount) * 100).toFixed(2),
        },
        'previousActiveUserMemberData': {
            previousTotalActiveUserMembersCount,
        },
        newMembersCount,
        previousNewMembersCount,
        'newMembersPercentageChange': (((newMembersCount - previousNewMembersCount) / newMembersCount)*100).toFixed(2),
        returningMembersCount,
        previousReturningMembersCount,
        'returningMembersPercentageChange': (((returningMembersCount - previousReturningMembersCount) / returningMembersCount)*100).toFixed(2),


    }

    return data;
}
