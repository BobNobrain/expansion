package planetgen

import "srv/internal/world"

func (ctx *planetGenContext) generateResorces() {
	ctx.resources = make(map[int][]world.ResourceDeposit)
}
