export type ImageItem = {
	slug: string;
	title: string;
	date: string;
	image: string;
	thumb: string;
	type: string;
	camera: string;
	lens: string;
	aperture: string;
	exposure: string;
	focalLength: string;
	iso: string;
	make: string;
	tags: string[];
};

export type ImageArray = {
	images: ImageItem[];
};
