import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const postsDir = path.join(__dirname, "../static/posts");
const outputFile = path.join(__dirname, "../src/data.json");

function parseFrontmatter(content) {
	const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
	const match = content.match(frontmatterRegex);

	if (!match) return null;

	const frontmatterStr = match[1];
	const data = {};

	let currentKey = null;
	let inArray = false;
	let arrayValues = [];

	const lines = frontmatterStr.split("\n");

	for (const line of lines) {
		// Check if this is an array item
		if (line.match(/^\s+-\s+/)) {
			if (currentKey && inArray) {
				let value = line.replace(/^\s+-\s+/, "").trim();
				// Remove quotes if present
				value = value.replace(/^["']|["']$/g, "");
				// Clean up null characters
				value = value.replace(/\0/g, "").trim();
				if (value) {
					arrayValues.push(value);
				}
			}
			continue;
		}

		// Check if this is a key-value pair
		const keyMatch = line.match(/^(\w+):\s*(.*)/);
		if (keyMatch) {
			// Save previous array if exists
			if (currentKey && inArray && arrayValues.length > 0) {
				data[currentKey] = arrayValues;
			}

			currentKey = keyMatch[1];
			let value = keyMatch[2].trim();

			// Check if value starts an array
			if (value === "") {
				inArray = true;
				arrayValues = [];
			} else {
				inArray = false;
				// Remove quotes if present
				value = value.replace(/^["']|["']$/g, "");
				// Clean up null characters
				value = value.replace(/\0/g, "").trim();
				data[currentKey] = value;
			}
		}
	}

	// Save last array if exists
	if (currentKey && inArray && arrayValues.length > 0) {
		data[currentKey] = arrayValues;
	}

	return data;
}

function generateData() {
	const posts = [];

	// Get all subdirectories in posts folder
	const dirs = fs
		.readdirSync(postsDir, { withFileTypes: true })
		.filter((dirent) => dirent.isDirectory())
		.map((dirent) => dirent.name);

	for (const dir of dirs) {
		const mdFile = path.join(postsDir, dir, `${dir}.md`);

		if (!fs.existsSync(mdFile)) {
			console.warn(`No markdown file found for ${dir}`);
			continue;
		}

		const content = fs.readFileSync(mdFile, "utf-8");
		const frontmatter = parseFrontmatter(content);

		if (!frontmatter) {
			console.warn(`No frontmatter found in ${dir}`);
			continue;
		}

		// Build the image path relative to static folder
		const imagePath = frontmatter.image
			? `/posts/${dir}/${frontmatter.image}`
			: null;
		const thumbPath = frontmatter.thumb
			? `/posts/${dir}/${frontmatter.thumb}`
			: null;

		posts.push({
			slug: frontmatter.slug || dir,
			title: frontmatter.title || dir,
			date: frontmatter.date || null,
			image: imagePath,
			thumb: thumbPath,
			type: frontmatter.type || "photo",
			camera: frontmatter.camera || null,
			lens: frontmatter.lens || null,
			aperture: frontmatter.aperture_friendly || null,
			exposure: frontmatter.exposure_friendly || null,
			focalLength: frontmatter.focal_length_friendly || null,
			iso: frontmatter.iso || null,
			make: frontmatter.make || null,
			tags: frontmatter.tags || [],
		});
	}

	// Sort by date (newest first)
	posts.sort((a, b) => {
		if (!a.date) return 1;
		if (!b.date) return -1;
		return new Date(b.date).getTime() - new Date(a.date).getTime();
	});

	// Write to data.json
	fs.writeFileSync(outputFile, JSON.stringify(posts, null, 2));

	console.log(`Generated ${outputFile} with ${posts.length} posts`);
}

generateData();
