package mesh

import "srv/internal/utils/geom"

const notFound VertexIndex = -1

func (b *MeshBuilder) SetEps(eps float64) {
	b.eps = eps
}

func (b *MeshBuilder) VertexCount() int {
	return len(b.verticies)
}

func (b *MeshBuilder) GetCoords(vi VertexIndex) geom.Vec3 {
	return b.verticies[vi]
}
func (b *MeshBuilder) SetCoords(vi VertexIndex, coords geom.Vec3) {
	b.verticies[vi] = coords
}

func (b *MeshBuilder) Add(v geom.Vec3) VertexIndex {
	vi := VertexIndex(len(b.verticies))
	b.verticies = append(b.verticies, v)
	b.topologyUpdated()
	return vi
}
func (b *MeshBuilder) AddCoords(x, y, z float64) VertexIndex {
	vi := VertexIndex(len(b.verticies))
	b.verticies = append(b.verticies, geom.Vec3{X: x, Y: y, Z: z})
	b.topologyUpdated()
	return vi
}
func (b *MeshBuilder) AddIfNotClose(v geom.Vec3) VertexIndex {
	result := b.Lookup(v)
	if result == notFound {
		result = b.Add(v)
	}
	return result
}
func (b *MeshBuilder) AddMany(vs []geom.Vec3) VertexIndex {
	vi := VertexIndex(len(b.verticies))
	b.verticies = append(b.verticies, vs...)
	b.topologyUpdated()
	return vi
}

func (b *MeshBuilder) Lookup(target geom.Vec3) VertexIndex {
	for idx, v := range b.verticies {
		if target.IsCloseTo(v, b.eps) {
			return VertexIndex(idx)
		}
	}

	return notFound
}

func (b *MeshBuilder) MapVerticies(f func(geom.Vec3, VertexIndex) geom.Vec3) {
	for i := 0; i < len(b.verticies); i++ {
		b.verticies[i] = f(b.verticies[i], VertexIndex(i))
	}
}
