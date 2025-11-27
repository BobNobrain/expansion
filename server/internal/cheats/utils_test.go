package cheats_test

import (
	"srv/internal/cheats"
	"testing"
)

func TestParserOnSimpleCommand(t *testing.T) {
	result, err := cheats.ParseCheatCommand("vibe_check 1")

	if err != nil {
		t.Fatalf("expected a successful parsing, but got %e", err)
	}

	if len(result.Positional) != 2 {
		t.Fatalf("expected 2 positional args, found %d (%+v)", len(result.Positional), result.Positional)
	}
	if result.Positional[0] != "vibe_check" {
		t.Fatalf("expected positional arg #0 to be 'vibe_check', found '%s'", result.Positional[0])
	}
	if result.Positional[1] != "1" {
		t.Fatalf("expected positional arg #1 to be '1', found '%s'", result.Positional[1])
	}

	if len(result.Named) != 0 {
		t.Fatalf("expected 0 named args, found %d", len(result.Named))
	}
}

func TestParserOnComplexCommand(t *testing.T) {
	result, err := cheats.ParseCheatCommand("give please base=123 inventory=1steel,2concrete test=r=3")

	if err != nil {
		t.Fatalf("expected a successful parsing, but got %e", err)
	}

	if len(result.Positional) != 2 {
		t.Fatalf("expected 2 positional args, found %d", len(result.Positional))
	}
	if result.Positional[0] != "give" {
		t.Fatalf("expected positional arg #0 to be 'give', found '%s'", result.Positional[0])
	}
	if result.Positional[1] != "please" {
		t.Fatalf("expected positional arg #1 to be 'please', found '%s'", result.Positional[1])
	}

	if len(result.Named) != 3 {
		t.Fatalf("expected 3 named args, found %d", len(result.Named))
	}
	if result.Named["base"] != "123" {
		t.Fatalf("expected named arg 'base' to be '123', found '%s'", result.Named["base"])
	}
	if result.Named["inventory"] != "1steel,2concrete" {
		t.Fatalf("expected named arg 'inventory' to be '1steel,2concrete', found '%s'", result.Named["inventory"])
	}
	if result.Named["test"] != "r=3" {
		t.Fatalf("expected named arg 'test' to be 'r=3', found '%s'", result.Named["test"])
	}
}
