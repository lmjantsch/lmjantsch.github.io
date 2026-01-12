// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

import cv_data from './cv.json'

// blog
export const ACTIVATE_BLOG = false // activates the blog section of the website.

// metadata
export const SITE_TITLE = "LMJ's Profile"; // title of page
export const SITE_DESCRIPTION = "Lasse Jantsch's my portfolio website!"; // description of page
export const IP_OWNER = 'Lasse Jantsch' // put your name

// Profile [top of profile page]
// change the profile picture in src/assets/profile_picture
export const GREETING = "👋 Hey, I'm Lasse"
export const INTRODUCTION = "A computer scientist with a background in economics specializing in the interpretability and reliability of Large Language Models. My research focuses on improving language models as reliable, large-scale text processing tools by leveraging the models internals for information extraction and task adaptation. Through my background in economics I ground my research not only in technical facination, but also in the social and economical implications of more reliable AI technology."
export const CONTACT_AND_CV = "Please contact me at lassejantsch [at] web.de."


// Socials:
// Must have 'type' and 'link' property. 'github', 'linkedin', and 'googlescholar' have designated icons.
// All other types will have a default icon. If you want a custom icon add it to src/components/Socials.astro.
export const SOCIALS = [
    {
        "type":'github', 
        "link": "https://github.com/lmjantsch"
    },
    {
        "type":'linkedin', 
        "link": "https://www.linkedin.com/in/lasse-jantsch-6985581a7"
    },
    {
        "type":'googlescholar', 
        "link": "https://scholar.google.com/citations?user=FjrsTUUAAAAJ"
    }
]

// Work Experience
// add details in cv.json 
// Each cv_data item should have 'title', 'type', and 'data'. The different types expect different data.
// Type 'list':
// data: [
//      {
//          'title': "bold part of list item",
//          'note': "second part of the first line of the list item",
//          (optional properties)
//          'details': [ 
//              'optional: list of bullet points hidden in toggle'
//          ],
//          'links': [
//              {
//                  'title': 'displayed string',
//                  'link': 'link string'
//              }
//          ]
//      }
//]
// Type 'logo-list'
// "data": [
//     {
//         "logo_path": "Path of logo svg (ex: ./knu_logo.svg for public/knu_logo.svg). Must be in the ppublic folder",
//         "logo_alt": "Alt text for logo (ex: Kyungpook National University Logo)",
//         "title": "Bold part of logo list",
//         "note": "Not bold part in first line",
//         "line1": "Second Line (ex: Focus: Natural Language Processing, Deep Learning)",
//         "line2": "Thid Line (ex: 2024 - 2026)"
//     },
// ]
//Type 'timeline':
// "data": [
//     {
//         "year":2025,
//         "data": {
//             "award": null,
//             "title": "FineCite: A New Framework For Fine-Grained Citation Context Analysis",
//             "authors": "Lasse Jantsch, Dong-Jae Koh, Seonghwan Yoon, Jisu Lee, Anne Lauscher, Young-Kyoon Suh",
//             "venue": "Finding of the Association for Computational Linguistics: ACL 2025",
//             "links": [
//                 {
//                     "title": "📄 Paper",
//                     "link": "https://aclanthology.org/2025.findings-acl.1259/"
//                 },                        
//                 {
//                     "title": "💻 Code",
//                     "link": "https://github.com/lab-paper-code/FineCite"
//                 }
//             ]
//         }
//     },
// ]
export const CVITEMS = cv_data
