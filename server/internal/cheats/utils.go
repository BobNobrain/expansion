package cheats

import (
	"srv/internal/utils/common"
	"unicode"
	"unicode/utf8"
)

func ParseCheatCommand(cmd string) (cheatCommand, common.Error) {
	parser := commandParser{input: cmd}
	parser.init()

	for !parser.isEOF() {
		parser.eatWhitespace()
		parser.eatAndSaveArgument()
	}

	return parser.result, parser.err
}

type commandParser struct {
	input string
	// current position (byte index)
	cursor int

	// unicode character at current position
	char rune
	// unicode character size in bytes at current position
	size int

	// parsing error
	err common.Error
	// parsed result
	result cheatCommand
}

func (c *commandParser) init() {
	c.cursor = 0
	c.err = nil
	c.result = cheatCommand{
		Next:       0,
		Positional: nil,
		Named:      make(map[string]string),
	}

	c.size = 0
	c.char = 0
	c.moveNext()
}

func (c *commandParser) eatAndSaveArgument() {
	argument := c.eatArgumentName()
	if c.char != '=' {
		c.result.Positional = append(c.result.Positional, argument)
		return
	}

	// c.char is '=', which means we're about to read named argument value
	c.moveNext()
	value := c.eatValue()
	c.result.Named[argument] = value
}

func (c *commandParser) eatArgumentName() string {
	start := c.cursor
	c.eatWhile(func(r rune) bool {
		return r != '=' && r != ' ' && unicode.IsPrint(r)
	})
	end := c.cursor
	return c.input[start:end]
}

func (c *commandParser) eatValue() string {
	start := c.cursor
	c.eatWhile(func(r rune) bool {
		return r != ' ' && unicode.IsPrint(r)
	})
	end := c.cursor
	return c.input[start:end]
}

func (c *commandParser) eatWhitespace() {
	c.eatWhile(unicode.IsSpace)
}

func (c *commandParser) eatWhile(predicate func(rune) bool) {
	for c.char != 0 && predicate(c.char) {
		c.moveNext()
	}
}

func (c *commandParser) moveNext() {
	c.cursor += c.size

	if c.cursor >= len(c.input) {
		c.char = 0
		c.size = 0
		c.cursor = len(c.input)
		return
	}

	char, size := utf8.DecodeRuneInString(c.input[c.cursor:])
	c.char = char
	c.size = size
}

func (c *commandParser) isEOF() bool {
	return c.char == 0
}
