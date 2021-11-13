class Group {
	constructor(id, name, groupId) {
		this.id = id
		this.name = name
		this.groupId = groupId
		this.wall = undefined
	}
	getIcon() {
		return `images/group_icons/${this.id}.png`
	}
	async fetchWall() {
		let res = await fetch(`data/walls/${this.id}.json`, {headers: {'content-type': 'application/json', accept: 'application/json'}})
		this.wall = await res.json()
		for (let [, post] of this.wall.entries()) {
			post.created = new Date(post.timestamp)
		}
	}
	getPage(posts, page = 0, postsPerPage = 20) {
		let pageStart = page * postsPerPage
		let pageEnd = (page + 1) * postsPerPage
		return posts.slice(pageStart, pageEnd)
	}
	async searchWall(query) {
		if (!this.wall) {
			await this.fetchWall()
		}
		let filtered = this.wall
		if (query.afterDate && query.afterDate.getTime()) {
			filtered = filtered.filter(post => post.created > query.afterDate)
		}
		if (query.beforeDate && query.beforeDate.getTime()) {
			filtered = filtered.filter(post => post.created < query.beforeDate)
		}
		if (query.body) {
			let queryBody = query.body.split(' ').map(str => new RegExp(`([^\\w]|^)${str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^\\w]|$)`, 'gimu'))
			filtered = filtered.filter(post => {
				for (let [, regex] of queryBody.entries()) {
					if (!post.body.match(regex)) {
						return false
					}
				}
				return true
			})
		}
		if (query.userId) {
			filtered = filtered.filter(post => post.posterId == query.userId)
		}
		if (query.reverse) {
			filtered = filtered.reverse()
		}
		return filtered
	}
}