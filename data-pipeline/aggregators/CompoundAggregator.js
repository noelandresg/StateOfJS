const experience = require('../conf/experience')
const userInfoAggregator = require('./user_info')
const sectionsAggregator = require('./sections')
const toolsAggregator = require('./tools')
const demographicAggregator = require('./demographic')
const globalOpinionsAggregator = require('./global_opinions')

class CompoundAggregator {
    constructor(config) {
        this.config = config
    }

    async computeUserInfo() {
        const salary = await userInfoAggregator.salary()
        const companySize = await userInfoAggregator.companySize()
        const yearsOfExperience = await userInfoAggregator.yearsOfExperience()

        return {
            salary,
            companySize,
            yearsOfExperience,
        }
    }

    async computeSections(sectionIds) {
        const surveyIds = Object.keys(this.config)

        const happiness = await sectionsAggregator.happiness(sectionIds, surveyIds, this.config)
        const otherTools = await sectionsAggregator.otherTools(sectionIds)

        const sections = sectionIds.map(sectionId => {
            return {
                section_id: sectionId,
                happiness: happiness[sectionId],
                otherTools: otherTools[sectionId],
            }
        })

        return sections
    }

    async computeTools(tools) {
        const surveyIds = Object.keys(this.config)

        const toolsExperiencesAggs = await toolsAggregator.experiences(tools, surveyIds, this.config)
        const toolsExperienceAggs = await toolsAggregator.experience(tools, surveyIds, this.config, experience.WOULD_USE)
        const toolsReasonsAggs = await toolsAggregator.reasons(tools)
        const toolsWouldUseByContinentAggs = await toolsAggregator.opinionByContinent(tools, experience.WOULD_USE)
        const toolsWouldUseByCountryAggs = await toolsAggregator.opinionByCountry(tools, experience.WOULD_USE)
        Object.keys(toolsExperienceAggs).forEach(tool => {
            toolsExperiencesAggs[tool][experience.WOULD_USE] = toolsExperienceAggs[tool]
            toolsExperiencesAggs[tool].reasons = toolsReasonsAggs[tool]
            toolsExperiencesAggs[tool][`${experience.WOULD_USE}_by_continent`] = toolsWouldUseByContinentAggs[tool]
            toolsExperiencesAggs[tool][`${experience.WOULD_USE}_by_country`] = toolsWouldUseByCountryAggs[tool]
        })

        return toolsExperiencesAggs
    }

    async computeDemographic() {
        return {
            by_continent: await demographicAggregator.byContinent(),
            by_country: await demographicAggregator.byCountry(),
            participation: await demographicAggregator.participationByCountry(),
            gender: await demographicAggregator.genderBreakdown(),
        }
    }

    async computeGlobalOpinions() {
        return globalOpinionsAggregator.globalOpinions()
    }
}

module.exports = CompoundAggregator
