package cheats

import (
	"srv/internal/components"
	"srv/internal/utils/common"
	"strconv"
	"strings"
	"unicode"
)

type Cheat interface {
	Run(cheatCommand, components.GlobalReposTx, components.UsecaseContext) (common.Encodable, common.Error)
}

type cheatEngine struct {
	cheats map[string]Cheat
}

func NewCheatEngine() components.CheatEngine {
	engine := &cheatEngine{
		cheats: make(map[string]Cheat),
	}

	engine.cheats["give"] = newGiveCheat()

	return engine
}

func (c *cheatEngine) Execute(cmd string, repos components.GlobalReposTx, context components.UsecaseContext) (common.Encodable, common.Error) {
	parsed, err := ParseCheatCommand(cmd)
	if err != nil {
		return nil, err
	}

	cmdName := parsed.GetNextArg()
	cheat := c.cheats[cmdName.String()]
	if cheat == nil {
		return nil, common.NewError(
			common.WithCode("ERR_UNKNOWN_COMMAND"),
			common.WithMessage("cannot execute cheat: unknown command"),
			common.WithDetail("positional", parsed.Positional),
			common.WithDetail("named", parsed.Named),
		)
	}

	return cheat.Run(parsed, repos, context)
}

type cheatCommand struct {
	Next       int
	Positional []string
	Named      map[string]string
}

func (c cheatCommand) GetCommandName() string {
	return c.Positional[0]
}

func (c *cheatCommand) GetNextArg(names ...string) cheatCommandArg {
	for _, name := range names {
		value, found := c.Named[name]
		if found {
			return cheatCommandArg(value)
		}
	}

	if c.Next >= len(c.Positional) {
		return ""
	}

	result := c.Positional[c.Next]
	c.Next += 1
	return cheatCommandArg(result)
}

type cheatCommandArg string

func (arg cheatCommandArg) String() string {
	return string(arg)
}
func (arg cheatCommandArg) Int() int {
	result, _ := strconv.Atoi(arg.String())
	return result
}
func (arg cheatCommandArg) Float() float64 {
	result, _ := strconv.ParseFloat(arg.String(), 64)
	return result
}
func (arg cheatCommandArg) Inventory() map[string]float64 {
	items := strings.Split(arg.String(), ",")
	result := make(map[string]float64)

	for _, item := range items {
		item = strings.TrimSpace(item)
		nameStarts := strings.IndexFunc(item, func(r rune) bool {
			return !unicode.IsDigit(r) && r != '.' && r != '-'
		})

		if nameStarts == -1 {
			continue
		}

		var amount float64 = 1.0
		if nameStarts > 0 {
			amount, _ = strconv.ParseFloat(item[:nameStarts], 64)
		}

		cid := item[nameStarts:]

		result[cid] += amount
	}

	return result
}
