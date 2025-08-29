# Keep It Simple Business Page

This project is a simple, customizable, single-page website designed for small businesses. It allows for easy content updates without needing to edit any complex code.

The page is built with HTML, CSS, and vanilla JavaScript. It features a component-based system where information is displayed in cards that can be pinned, unpinned, and shared via a URL.

## How to Update Your Website Content

Follow this simple two-step process to update the information on your website.

### Step 1: Edit Content Files

All of your website's content is stored as plain text (`.txt`) files in the `components` directory.

-   **To edit existing information:** Open the corresponding file in the `components` folder (e.g., `phone.txt` or `hours.txt`) and make your changes.
-   **To add a new section:** Create a new `.txt` file in the `components` folder. The name of the file will become the title of the component (e.g., `our-mission.txt` will create a component called "Our Mission").
-   **To remove a section:** Simply delete the corresponding `.txt` file from the `components` folder.

#### Adding Search Keywords

To improve the searchability of your components, you can add a line of comma-separated keywords to any `.txt` file in the `components` directory. These keywords will be used by the search bar but will not be displayed on the page.

The line must start with `keywords:`.

**Example (`history.txt`):**
```
Our business was founded in 2020 with the goal of simplicity.
keywords: about us, story, background, company information, founded
```

You can add these keywords manually, or for a faster workflow, you can use an LLM to suggest relevant keywords based on the component's content.

### Step 2: Publish Your Changes

After you have finished editing the content files, you need to run a command to publish your changes to the live website.

Open your terminal, make sure you are in the project directory, and run the following command:

```bash
python3 generate_components.py
```

That's it! Your website will now be updated with the new information.
