package assets

type DevUsersAssetJSONData struct {
	Users []DevUserJSONData `json:"users"`
}

type DevUserJSONData struct {
	Username string              `json:"username"`
	Email    string              `json:"email"`
	Password string              `json:"password"`
	Org      *DevUserOrgJSONData `json:"org"`
}

type DevUserOrgJSONData struct {
	Name   string `json:"name"`
	Ticker string `json:"ticker"`
}

func LoadDevUsers() (*DevUsersAssetJSONData, error) {
	result := &DevUsersAssetJSONData{}
	err := globalLoader.loadJSONAsset(globalLoader.assetName("dev", "users.json"), result)
	return result, err
}
