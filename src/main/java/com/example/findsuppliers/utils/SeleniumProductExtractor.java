package com.example.findsuppliers.utils;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;
import java.util.List;

public class SeleniumProductExtractor {
    public static void main(String[] args) {
        // Set the path to the ChromeDriver executable (if not in PATH)
        // System.setProperty("webdriver.chrome.driver", "/path/to/chromedriver");

        ChromeOptions options = new ChromeOptions();
        // options.addArguments("--headless");

        WebDriver driver = new ChromeDriver(options);
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(20)); // Increased timeout

        try {
            driver.get("https://jysk.ro/search?query=canapea&type=product");
            System.out.println("Successfully navigated to the page.");

            // *** WAIT FOR THE PRODUCT CONTAINERS TO LOAD ***
            wait.until(ExpectedConditions.presenceOfAllElementsLocatedBy(By.className("product-container")));

            // Find all product containers
            List<WebElement> productContainers = driver.findElements(By.className("product-container"));

            System.out.println("Found " + productContainers.size() + " product containers.");

            // Iterate through each product container and extract information
            for (WebElement productContainer : productContainers) {
                // Extract the product name
                WebElement nameElement = productContainer.findElement(By.className("product-teaser-title__name")); // Shortened class name
                String name = (nameElement != null) ? nameElement.getText() : "N/A";

                // Extract the price
                WebElement priceElement = productContainer.findElement(By.className("product-price-value"));
                String price = (priceElement != null) ? priceElement.getText() : "N/A";

                // Extract the photo URL
                WebElement photoElement = productContainer.findElement(By.cssSelector("img.img-responsive")); // Simplified CSS selector
                String photoUrl = (photoElement != null) ? photoElement.getAttribute("src") : "N/A";

                System.out.println("--------------------");
                System.out.println("Name: " + name);
                System.out.println("Price: " + price);
                System.out.println("Photo URL: " + photoUrl);
            }

        } finally {
            driver.quit();
        }
    }
}