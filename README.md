# Astro Academic Resume & Portfolio

![License](https://img.shields.io/badge/license-MIT-blue.svg)

A clean, modern, and responsive template for creating your academic resume and portfolio website. Built with [Astro](https://astro.build/ "null"), styled with [Tailwind CSS](https://tailwindcss.com/ "null"), and ready to be deployed to GitHub Pages with GitHub Actions.

This template is designed to be easily customizable, allowing you to showcase your publications, education, experience, and more with a professional look.

**You can find a life demo at [lmjantsch.github.io](lmjantsch.github.io)**


## Features

- **Fast & Performant**: Built with Astro for a super-fast, static-first website.

- **Easy to Customize**: All personal data is centralized in `src/data/consts.ts` and `src/data/cv.json`.

- **Responsive Design**: Looks great on all devices, from mobile phones to desktops.

- **Dark Mode**: Includes a theme switcher for light and dark modes.

- **Optional Blog**: Easily enable or disable a fully-featured blog powered by MDX.

- **Deploy Ready**: Comes with a pre-configured GitHub Actions workflow for easy deployment to GitHub Pages.


## Getting Started

Follow these steps to get your own version of the website up and running.


### Prerequisites

- [Node.js](https://nodejs.org/ "null") (v18 or higher)

- [Yarn](https://yarnpkg.com/ "null") or npm


### 1. Set Up The Project

First, clone the repository to your local machine and navigate into the project directory.

    git clone [https://github.com/your-username/academic_resume.git](https://github.com/your-username/academic_resume.git)
    cd academic_resume

Next, install the project dependencies.

    # Using yarn (recommended)
    yarn install

    # Or using npm
    npm install


### 2. Run Locally

Start the local development server to see a live preview of your site.

    # Using yarn
    yarn dev

    # Or using npm
    npm run dev

Your site is now running at `http://localhost:4321/`. Open this URL in your browser. The site will automatically update as you edit the files.


## Configuration Guide

All your personal information is stored in two main files: `src/data/consts.ts` and `src/data/cv.json`. Editing these files is all you need to do to personalize the site.


### Changing the Profile Picture

To change your profile picture, replace the file `profile_picture.jpg` located in the `src/assets/` folder with your own image. For best results, use a square image. Your new image file **must** be named `profile_picture.jpg`.


### 1. `src/data/consts.ts`

This file contains general site metadata and the text for your profile introduction.

    // src/data/consts.ts

    // Toggle the blog on or off
    export const ACTIVATE_BLOG = false;

    // Metadata for the website (appears in browser tabs and search results)
    export const SITE_TITLE = "Your Name's Profile";
    export const SITE_DESCRIPTION = "Your portfolio website!";
    export const IP_OWNER = 'Your Name'; // For the copyright footer

    // Profile section text
    export const GREETING = "👋 Hey, I'm [Your Name]";
    export const INTRODUCTION = "Your detailed professional introduction goes here...";
    export const CONTACT_AND_CV = "Contact info or a link to your PDF CV goes here.";

    // Social media links
    // 'github', 'linkedin', and 'googlescholar' have special icons.
    // Any other 'type' will use a generic link icon.
    export const SOCIALS = [
        {
            "type":'github',
            "link": "[https://github.com/your-username](https://github.com/your-username)"
        },
        {
            "type":'linkedin',
            "link": "[https://www.linkedin.com/in/your-profile](https://www.linkedin.com/in/your-profile)"
        },
        // ... add more as needed
    ];


### 2. `src/data/cv.json`

This file holds the structured data for your CV sections (Publications, Education, Experience, etc.). It's an array of objects, where each object represents a section on your profile page.

Each section object has a `title`, a `type`, and `data`. The `type` determines how the `data` is structured and displayed. There are three types available:


#### Type: `timeline`

Perfect for date-ordered items like publications. It groups items by year.

- **`year`**: The publication year.

- **`data`**: An object containing the publication details.

  - `award`: (Optional) A string for any awards, like "🏆 Best Poster Award".

  - `title`: The title of the paper.

  - `authors`: A string of authors. **Note**: Your name is hardcoded as 'Lasse Jantsch' in `src/components/cv_components/CvPublicationItem.astro` for highlighting. You will need to change it there to have your own name bolded.

  - `venue`: The conference or journal name.

  - `links`: An array of links (e.g., Paper, Code).

**Example:**

    {
        "title": "📄 Publications",
        "type": "timeline",
        "data": [
            {
                "year": 2025,
                "data": {
                    "award": null,
                    "title": "Your Awesome Paper Title",
                    "authors": "Your Name, Co-author One, Co-author Two",
                    "venue": "Conference on Important Research (CIR)",
                    "links": [
                        { "title": "📄 Paper", "link": "#" },
                        { "title": "💻 Code", "link": "#" }
                    ]
                }
            }
        ]
    }


#### Type: `logo-list`

Ideal for education or affiliations where a logo is helpful.

- `logo_path`: The path to the logo image. **Place your logo images (e.g., `my_logo.svg`) in the `/public` folder**, and the path will be `./my_logo.svg`.

- `logo_alt`: Alt text for the logo.

- `title`: The main title (e.g., "M.Sc. Computer Science").

- `note`: The institution name.

- `line1`: The first line of description (e.g., focus area).

- `line2`: The second line of description (e.g., dates).

**Example:**

    {
        "title": "🎓 Education",
        "type": "logo-list",
        "data": [
            {
                "logo_path": "./university_logo.svg",
                "logo_alt": "University Logo",
                "title": "M.Sc. Computer Science",
                "note": "University Name",
                "line1": "Focus: Your Research Area",
                "line2": "2024 - 2026"
            }
        ]
    }


#### Type: `list`

A flexible list for experience, awards, volunteering, etc. Supports expandable details.

- `title`: The main title (e.g., "Graduate Research Assistant").

- `note`: The affiliation and dates.

- `details`: (Optional) An array of strings that will appear as a collapsible list of bullet points.

- `links`: (Optional) An array of relevant links.

**Example:**

    {
        "title": "🔬 Research Experience",
        "type": "list",
        "data": [
            {
                "title": "Graduate Research Assistant",
                "note": "University Name (Mar 2024 - Present)",
                "details": [
                    "Accomplishment one.",
                    "Accomplishment two."
                ],
                "links": [
                    { "title": "🌐 Project Website", "link": "#" }
                ]
            }
        ]
    }


## Optional Blog

This template includes an optional, but fully functional, blog section.


### Activating the Blog

To activate the blog, open `src/data/consts.ts` and change the `ACTIVATE_BLOG` variable to `true`:

    // src/data/consts.ts
    export const ACTIVATE_BLOG = true;

When activated, the blog will become your homepage, displaying your profile on the left and a scrollable list of posts on the right (on desktop). On mobile, the profile appears above the posts.


### Adding New Posts

1. Navigate to the `src/posts/` directory.

2. Create a new folder for your post (e.g., `my-first-post`).

3. Inside this new folder, create an `index.mdx` file.

4. Write your blog post in this file using Markdown and (optionally) React components. Make sure to include the frontmatter at the top (title, description, date, slug).

**Note:** The blog feature is functional but is still a work-in-progress and is not yet fully optimized. The styling and layout may be subject to change in future updates.


## Deployment to GitHub Pages

This project includes a GitHub Actions workflow that automatically builds and deploys your site whenever you push changes to the `main` branch.


### 1. Create a GitHub Repository

Create a new repository on GitHub. If you plan to use `https://<your-username>.github.io` as your URL, name the repository `<your-username>.github.io`. Otherwise, you can name it anything (e.g., `my-portfolio`) and it will be publisched to `https://<your-username>.github.io/<name of repository>`.

Push your local project to this new repository.

    git remote add origin <your repository>
    git branch -M main
    git push -u origin main


### 2. Configure the Site URL

You **must** update the site URL in `astro.config.mjs` for the deployment to work correctly.

    // astro.config.mjs
    import { defineConfig } from 'astro/config';
    // ... other imports

    export default defineConfig({
      // IMPORTANT: Change this to your repository's URL
      // Case 1: For a user/organization page (repo named <username>.github.io)
      site: '<your-username>.github.io',

      // Case 2: For a project page (repo with a different name)
      // site: 'https://<your-username>.github.io/<name of repository>',
      // ... rest of the config
    });

Make sure to commit and push this change.


### 3. Enable GitHub Pages

1. In your GitHub repository, go to **Settings** > **Pages**.

2. Under "Build and deployment", select **GitHub Actions** as the source.

3. GitHub will automatically detect the workflow file in your repository.

That's it! The workflow in `.github/workflows/deploy.yml` will now run every time you push to the `main` branch. After the first run completes (usually takes a minute or two), your website will be live at the URL you configured.

Feel free to open an issue or submit a pull request if you have suggestions for improvement. Happy coding!
