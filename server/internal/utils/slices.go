package utils

import "slices"

func FastRemove[S ~[]E, E comparable](slice S, elt E) S {
	idx := slices.Index(slice, elt)
	if idx != -1 {
		slice[idx] = slice[len(slice)-1]
		return slice[:len(slice)-1]
	}

	return slice
}
