import { promises as fs } from 'fs'
import path from 'path'

const routes = []
// path to routes dir
const path_to_routes = path.join(path.resolve(), '/src/routes/')

// import and store all routes from dir 
for(const route of await fs.readdir(path_to_routes)) {
    const file = (await import(path.join(path_to_routes, route))).default
    routes.push({
        route: `/${file.route}`,
        router: file.router
    })
}

export {
    routes
}