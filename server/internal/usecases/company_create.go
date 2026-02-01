package usecases

import (
	"srv/internal/components"
	"srv/internal/utils/common"
)

func MakeCompanyCreateUC(repos components.GlobalRepos) components.UsecaseWithOutput[CompanyCreateInput, any] {
	return makeTransactionalUsecase(CompanyCreateFactory{}, repos)
}

type CompanyCreateInput struct {
	Name string
	Logo []any
}

func (i CompanyCreateInput) Validate() common.Error {
	if len(i.Name) < 4 || 50 <= len(i.Name) {
		return common.NewValidationError("CompanyCreateInput.Name", "Must be 4-50 characters long")
	}

	if len(i.Logo) < 2 {
		return common.NewValidationError("CompanyCreateInput.Logo", "Must have at least 2 elements")
	}

	return nil
}

type CompanyCreateFactory struct{}

func (f CompanyCreateFactory) Produce(
	tuc TransactionalUsecaseContext[CompanyCreateInput],
) TransactionalUsecase[CompanyCreateInput, any] {
	return &companyCreateInstance{
		TransactionalUsecaseContext: tuc,
	}
}

type companyCreateInstance struct {
	TransactionalUsecaseContext[CompanyCreateInput]
}

func (uc *companyCreateInstance) Setup() common.Error {
	companies, err := uc.tx.Companies().GetOwnedCompanies(uc.Author)
	if err != nil {
		return err
	}

	if len(companies) != 0 {
		return common.NewRequirementsError(
			"You have reached maximum amount of companies",
			common.WithDetail("nCompanies", len(companies)),
		)
	}

	return nil
}

func (uc *companyCreateInstance) Execute() (any, common.Error) {
	err := uc.tx.Companies().Create(components.CreateCompanyPayload{
		Founder: uc.Author,
		Name:    uc.input.Name,
	})

	if err != nil {
		return nil, err
	}

	return nil, nil
}
