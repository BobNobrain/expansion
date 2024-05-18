package domain

type Username string
type UserID string

type User struct {
	ID       UserID
	Username Username
	Email    string
	Roles    []UserRole
}

type UserCredentials struct {
	Username     Username
	PasswordHash string
}

type UserRole string

const (
	UserRoleTrusted       UserRole = "trusted"
	UserRoleNamesReviewer UserRole = "names_reviewer"
)
