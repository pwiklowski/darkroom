export class Gallery{
    Id: string;
    Name: string;
    Comment: string;
    UsersIDs: Array<string> = [];

    url;
    coverUrl;
}

export class Photo{
    Width: number;
    Height: number;

}