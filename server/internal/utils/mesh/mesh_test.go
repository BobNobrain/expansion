package mesh_test

import (
	"srv/internal/utils/mesh"
	"testing"
)

func TestMeshBuilder(t *testing.T) {
	t.Run("MeshBuilder connections", func(t *testing.T) {
		icosa := mesh.CreateSubdividedIcosahedron(1, 2)

		cons := icosa.GetConnections()

		shouldBeConnected := []struct {
			a mesh.VertexIndex
			b mesh.VertexIndex
		}{
			{a: 8, b: 1},
			{a: 1, b: 8},
			{a: 0, b: 1},
			{a: 1, b: 10},
			{a: 10, b: 1},
			{a: 0, b: 5},
			{a: 0, b: 4},
			{a: 0, b: 10},
			{a: 8, b: 0},
			{a: 8, b: 4},
		}

		shouldNotBeConnected := []struct {
			a mesh.VertexIndex
			b mesh.VertexIndex
		}{
			{a: 8, b: 7},
			{a: 7, b: 8},
			{a: 0, b: 3},
			{a: 9, b: 10},
		}

		for _, pair := range shouldBeConnected {
			if !cons.AreConnected(pair.a, pair.b) {
				t.Errorf("should be connected: %d-%d", pair.a, pair.b)
			}
		}

		for _, pair := range shouldNotBeConnected {
			if cons.AreConnected(pair.a, pair.b) {
				t.Errorf("should not be connected: %d-%d", pair.a, pair.b)
			}
		}
	})

	t.Run("MeshBuilder::FindConnectedFaces", func(t *testing.T) {
		th := mesh.CreateTestTetrahedron()

		if len(th.FindConnectedFaces([]mesh.VertexIndex{0})) != 3 {
			t.Errorf("should have 3 faces found connected to #0 in tetrahedron")
		}

		if len(th.FindConnectedFaces([]mesh.VertexIndex{0, 1})) != 2 {
			t.Errorf("should have 2 faces found connected to #0 and #1 in tetrahedron")
		}
	})
}
