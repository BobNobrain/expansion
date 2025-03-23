package game

import "fmt"

type WorkforceLevel byte

const (
	WorkforceLevelIntern WorkforceLevel = 0b0010_0000
	WorkforceLevelAppren WorkforceLevel = 0b0100_0000
	WorkforceLevelMaster WorkforceLevel = 0b0110_0000
)

func (l WorkforceLevel) String() string {
	switch l {
	case WorkforceLevelIntern:
		return "intern"
	case WorkforceLevelAppren:
		return "apprentice"
	case WorkforceLevelMaster:
		return "master"

	default:
		return fmt.Sprintf("wflevel_unknown(%b)", l)
	}
}

type WorkforceExpertise byte

const (
	WorkforceExpertiseNone WorkforceExpertise = iota
	WorkforceExpertisePhys
	WorkforceExpertiseMgmt
	WorkforceExpertiseEngr
	WorkforceExpertiseRsch
)

func (e WorkforceExpertise) String() string {
	switch e {
	case WorkforceExpertiseNone:
		return "none"
	case WorkforceExpertisePhys:
		return "physical"
	case WorkforceExpertiseMgmt:
		return "management"
	case WorkforceExpertiseEngr:
		return "engineering"
	case WorkforceExpertiseRsch:
		return "research"

	default:
		return fmt.Sprintf("expertise_unknown(%b)", e)
	}
}

type WorkforceType byte

const (
	WorkforceTypeInvalid        = WorkforceType(0)
	WorkforceTypeIntern         = WorkforceType(byte(WorkforceExpertiseNone) | byte(WorkforceLevelIntern))
	WorkforceTypeWorker         = WorkforceType(byte(WorkforceExpertisePhys) | byte(WorkforceLevelAppren))
	WorkforceTypeForeman        = WorkforceType(byte(WorkforceExpertisePhys) | byte(WorkforceLevelMaster))
	WorkforceTypeManager        = WorkforceType(byte(WorkforceExpertiseMgmt) | byte(WorkforceLevelAppren))
	WorkforceTypeCLevel         = WorkforceType(byte(WorkforceExpertiseMgmt) | byte(WorkforceLevelMaster))
	WorkforceTypeEngineer       = WorkforceType(byte(WorkforceExpertiseEngr) | byte(WorkforceLevelAppren))
	WorkforceTypeSeniorEngineer = WorkforceType(byte(WorkforceExpertiseEngr) | byte(WorkforceLevelMaster))
	WorkforceTypeResearcher     = WorkforceType(byte(WorkforceExpertiseRsch) | byte(WorkforceLevelAppren))
	WorkforceTypeScientist      = WorkforceType(byte(WorkforceExpertiseRsch) | byte(WorkforceLevelMaster))
)

func (t WorkforceType) GetExpertise() WorkforceExpertise {
	return WorkforceExpertise(t & 0b0001_1111)
}

func (t WorkforceType) GetLevel() WorkforceLevel {
	return WorkforceLevel(t & 0b1110_0000)
}

func (t WorkforceType) IsValid() bool {
	return t != WorkforceTypeInvalid
}

func (t WorkforceType) String() string {
	switch t {
	case WorkforceTypeIntern:
		return "intern"
	case WorkforceTypeWorker:
		return "worker"
	case WorkforceTypeForeman:
		return "foreman"
	case WorkforceTypeManager:
		return "manager"
	case WorkforceTypeCLevel:
		return "clevel"
	case WorkforceTypeEngineer:
		return "engineer"
	case WorkforceTypeSeniorEngineer:
		return "senior"
	case WorkforceTypeResearcher:
		return "researcher"
	case WorkforceTypeScientist:
		return "scientist"

	case WorkforceTypeInvalid:
		return "invalid"
	default:
		return fmt.Sprintf("wftype_unknown(%b)", t)
	}
}

func ParseWorkforceType(input string) WorkforceType {
	switch input {
	case "intern":
		return WorkforceTypeIntern
	case "worker":
		return WorkforceTypeWorker
	case "foreman":
		return WorkforceTypeForeman
	case "manager":
		return WorkforceTypeManager
	case "clevel":
		return WorkforceTypeCLevel
	case "engineer":
		return WorkforceTypeEngineer
	case "seniorengineer":
		return WorkforceTypeSeniorEngineer
	case "researcher":
		return WorkforceTypeResearcher
	case "scientist":
		return WorkforceTypeScientist

	default:
		return WorkforceTypeInvalid
	}
}
