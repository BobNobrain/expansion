package assets

type DevUsersAssetJSONData struct {
	Users []DevUserJSONData `json:"users"`
}

type DevUserJSONData struct {
	Username string              `json:"username"`
	Password string              `json:"password"`
	Org      *DevUserOrgJSONData `json:"org"`
}

type DevUserOrgJSONData struct {
	Name   string `json:"name"`
	Ticker string `json:"ticker"`
}

func (l *AssetLoader) LoadDevUsers() (*DevUsersAssetJSONData, error) {
	result := &DevUsersAssetJSONData{}
	err := l.loadJSONAsset(l.assetName("dev", "users.json"), result)
	return result, err
}
