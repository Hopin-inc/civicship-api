export class MockImageService {
  static uploadPublicImage = jest.fn().mockResolvedValue({
    bucket: "test-bucket",
    folderPath: "test-folder",
    filename: "test-file.jpg",
    url: "https://test-url.com/test-file.jpg",
    alt: "test alt",
    caption: "test caption",
    ext: ".jpg",
    mime: "image/jpeg",
    isPublic: true,
  });
}
