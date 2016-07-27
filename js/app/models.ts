export class Photo {
	Id          :string
	Location    :string
	Width: number;
	Height: number;
	Size: number;
	Comment:     string;
	GalleryId:   string;
	Name:        string;
	Resolutions: Array<string>;
}

export class Gallery  {
	Id         :string;
	Name       :string;
	Comment    :string;
	CoverPhoto :string;
}
