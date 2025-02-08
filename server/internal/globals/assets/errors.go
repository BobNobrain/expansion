package assets

import "srv/internal/utils/common"

type assetError struct {
	code      string
	msg       string
	AssetName string `json:"asset"`
}

func (a *assetError) Encode() interface{} {
	return a
}
func (a *assetError) Code() string {
	return a.code
}
func (a *assetError) Details() common.Encodable {
	return a
}
func (a *assetError) Error() string {
	return a.msg
}
func (a *assetError) IsRetriable() bool {
	return false
}

func newAssetParseError(assetName string, err error) common.Error {
	return &assetError{
		code:      "ERR_ASSET_PARSE",
		msg:       err.Error(),
		AssetName: assetName,
	}
}

func newAssetLoadError(assetName string, err error) common.Error {
	return &assetError{
		code:      "ERR_ASSET_LOAD",
		msg:       err.Error(),
		AssetName: assetName,
	}
}

func newAssetSaveError(assetName string, err error) common.Error {
	return &assetError{
		code:      "ERR_ASSET_SAVE",
		msg:       err.Error(),
		AssetName: assetName,
	}
}
