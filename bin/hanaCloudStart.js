// @ts-check
import * as base from '../utils/base.js'
import * as cf from '../utils/cf.js'

export const command = 'hcStart [name]'
export const aliases = ['hcstart', 'hc_start', 'start']
export const describe = base.bundle.getText("hcStart")

export const builder = base.getBuilder({
    name: {
        alias: ['n'],
        type: 'string',
        default: `**default**`,
        desc: base.bundle.getText("hc_instance_name")
    }
}, false)

export function handler (argv) {
    base.promptHandler(argv, hcStart, {
        name: {
            description: base.bundle.getText("hc_instance_name"),
            type: 'string',
            required: true
        }
    }, false)
}

function suggestHanaCli(stdout, instanceName) {
    let out = stdout.split("\n")

    // Replace message 'Update in progress. Use 'cf services' or 'cf service dbhana-hana' to check operation status.'
    if(out[3]){
        out[3] = `${base.bundle.getText("hc.updateProgress")}. ${base.bundle.getText("hc.progress", [instanceName])}`
    }
    return out.join("\n")
}

export async function hcStart(prompts) {
    base.debug(`hcStart`)
    try {

        let results = ''
        if (prompts.name === '**default**') {
            results = await cf.getHANAInstances()
        } else {
            results = await cf.getHANAInstanceByName(prompts.name)
        }
        // @ts-ignore
        if(!results || !results.resources){
            return base.error(new Error(base.bundle.getText("hc.error")))
        }
        // @ts-ignore
        for (let item of results.resources) {
            const stdout = await cf.startHana(item.name)
            console.log(suggestHanaCli(stdout, item.name))
        }
        return base.end()
    } catch (error) {
        base.error(error)
    }
}