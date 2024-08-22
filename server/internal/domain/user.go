package domain

type Username string
type UserID string

func (uid UserID) IsEmpty() bool {
	return len(uid) == 0
}

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
