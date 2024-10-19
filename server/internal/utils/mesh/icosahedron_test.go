package mesh_test

import (
	"srv/internal/utils/geom/mesh"
	"testing"
)

func TestIcosahedron(t *testing.T) {
	t.Run("simple icosahedron looks ok", func(t *testing.T) {
		minimal := mesh.CreateSubdividedIcosahedron(1, 2)

		if minimal.FaceCount() != 20 {
			t.Errorf("wrong face count (expected 20, got %d)", minimal.FaceCount())
		}

		if minimal.VertexCount() != 12 {
			t.Errorf("wrong vertex count (expected 12, got %d)", minimal.VertexCount())
		}
	})

	t.Run("subdivided icosahedron looks ok", func(t *testing.T) {
		for subdivision := 3; subdivision < 6; subdivision++ {
			icosa := mesh.CreateSubdividedIcosahedron(1, subdivision)

			// each of 20 original faces splits into (subdivision-1)^2 new trinangles
			expectedFaceCount := 20 * (subdivision - 1) * (subdivision - 1)
			if icosa.FaceCount() != expectedFaceCount {
				t.Errorf(
					"wrong face count for subdiv=%d (expected %d, got %d)",
					subdivision, expectedFaceCount, icosa.FaceCount(),
				)
			}

			// subdivided icosahedron contains:
			// - 12 old verticies,
			// - (subdivision-3)(subdivision-2)/2 new verticies for each face,
			// - (subdivision-2) new verticies for each edge
			expectedVertexCount := 12 + 20*(subdivision-3)*(subdivision-2)/2 + 30*(subdivision-2)
			if icosa.VertexCount() != expectedVertexCount {
				t.Errorf(
					"wrong vertex count for subdiv=%d (expected %d, got %d)",
					subdivision, expectedVertexCount, icosa.VertexCount(),
				)
			}
		}
	})
}
