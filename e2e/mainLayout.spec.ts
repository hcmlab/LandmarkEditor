import { expect, test } from '@playwright/test';

test.describe('check title and main page layout', () => {
  test('visits the app root url and checks elements layout', async ({ page }) => {
    await page.goto('/');

    await test.step('check main page layout', async () => {
      // Check element relative width to container
      const containerHandle = page.locator('#app');
      const sidebar = page.locator('#sidebar');
      const canvas = page.locator('#canvas-div');
      const thumbnails = page.locator('#thumbnail-gallery');

      const containerBox = await containerHandle.boundingBox();
      expect(containerBox).not.toBe(null);
      const sidebarBox = await sidebar.boundingBox();
      expect(sidebarBox).not.toBe(null);
      const canvasBox = await canvas.boundingBox();
      expect(canvasBox).not.toBe(null);
      const thumbnailsBox = await thumbnails.boundingBox();
      expect(thumbnailsBox).not.toBe(null);

      const sidebarWidth = sidebarBox?.width;
      const canvasWidth = canvasBox?.width;
      const thumbnailsWidth = thumbnailsBox?.width;
      const containerWidth = containerBox?.width;

      expect(sidebarWidth).not.toBe(undefined);
      expect(canvasWidth).not.toBe(undefined);
      expect(thumbnailsWidth).not.toBe(undefined);
      expect(containerWidth).not.toBe(undefined);

      const baseFontSize = 16; // 1rem = 16px
      expect(sidebarWidth).toBeCloseTo(20 * baseFontSize, 1);
      expect(thumbnailsWidth).toBeCloseTo(10 * baseFontSize, 1);
      expect(sidebarWidth + thumbnailsWidth + canvasWidth).toBeCloseTo(containerWidth, -3);
    });

    await test.step('check navbar brand', async () => {
      await expect(page.locator('#title')).toHaveText('Face Mesh Editor');
      const icon = page.locator('#app-icon');
      await expect(icon).toBeVisible();
    });

    const navbarButtonContainer = page.locator('#navbar-buttons');

    await test.step('check navbar sizing', async () => {
      expect(navbarButtonContainer).not.toBe(null);
      await expect(navbarButtonContainer).toBeVisible();

      // check relative width to parent
      const navbarParent = navbarButtonContainer.locator('..');
      await expect(navbarParent).toBeVisible();
      const navbarParentBox = await navbarParent.boundingBox();
      expect(navbarParentBox).not.toBe(null);
      const navbarButtonContainerBox = await navbarButtonContainer.boundingBox();
      expect(navbarButtonContainerBox).not.toBe(null);
    });

    await test.step('check navbar dropdown menu layout', async () => {
      // check child elements
      const navItems = navbarButtonContainer.locator('.nav-item');
      const navItemsCount = await navItems.count();
      expect(navItemsCount).toBe(3);
      // Verify the order of child elements: File, Edit, About
      const firstNavItemText = await navItems.nth(0).innerText();
      expect(firstNavItemText.trim()).toBe('File');

      const secondNavItemText = await navItems.nth(1).innerText();
      expect(secondNavItemText.trim()).toBe('Edit');

      const thirdNavItemText = await navItems.nth(2).innerText();
      expect(thirdNavItemText.trim()).toBe('About');
    });

    await test.step('check file dropdown menu', async () => {
      // File menu
      const fileDropdown = page.locator('#file-dropdown');
      await expect(fileDropdown).toBeVisible();

      // if not clicked the other buttons should be invisible
      const openImagesButton = page.locator('#button-open-images');
      await expect(openImagesButton).toBeHidden();

      const openAnnotationsButton = page.locator('#button-open-annotations');
      await expect(openAnnotationsButton).toBeHidden();

      const downloadAllButton = page.locator('#button-download-all');
      await expect(downloadAllButton).toBeHidden();

      await fileDropdown.click();

      await expect(openImagesButton).toBeVisible();
      await expect(openAnnotationsButton).toBeVisible();
      await expect(downloadAllButton).toBeVisible();
    });

    await test.step('check edit dropdown menu', async () => {
      const editDropdown = page.locator('#edit-dropdown');
      await expect(editDropdown).toBeVisible();

      // if not clicked the other buttons should be invisible
      const undoButton = page.locator('#button-undo');
      await expect(undoButton).toBeHidden();

      const redoButton = page.locator('#button-redo');
      await expect(redoButton).toBeHidden();

      const resetButton = page.locator('#button-reset');
      await expect(resetButton).toBeHidden();

      await editDropdown.click();

      await expect(undoButton).toBeVisible();
      await expect(redoButton).toBeVisible();
      await expect(resetButton).toBeVisible();
    });

    await test.step('check about dropdown menu', async () => {
      const aboutDropdown = page.locator('#about-dropdown');
      await expect(aboutDropdown).toBeVisible();

      const githubButton = page.locator('#button-github');
      await expect(githubButton).toBeHidden();

      const buttonReportIssue = page.locator('#button-report-issue');
      await expect(buttonReportIssue).toBeHidden();

      const buttonQuestion = page.locator('#button-question');
      await expect(buttonQuestion).toBeHidden();

      const buttonInfo = page.locator('#button-info');
      await expect(buttonInfo).toBeHidden();

      await aboutDropdown.click();

      await expect(githubButton).toBeVisible();
      await expect(buttonReportIssue).toBeVisible();
      await expect(buttonQuestion).toBeVisible();
      await expect(buttonInfo).toBeVisible();
    });
  });
});
