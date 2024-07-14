// server.js
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const port = 3000;

app.use(express.json());

// Endpoint to fetch book details by ISBN
app.get('bookswagon/:isbn', async (req, res) => {
  const isbn = req.params.isbn;
  const url = `https://www.bookswagon.com/search-books/${isbn}`;

  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    // Example scraping logic (customize as per your needs)
    const bookDetails = {};

    // Extracting label content example
    const label = $('#ctl00_phBody_ProductDetail_lblourPrice').text().trim();
    bookDetails.labelContent = label;

    // Extracting book details example
    const bookDetailDiv = $('#bookdetail');
    const details = {};
    bookDetailDiv.find('li').each((i, elem) => {
      const key = $(elem).find('span.font-weight-bold').text().replace(':', '').trim();
      const value = $(elem).contents().not($(elem).find('span.font-weight-bold')).text().trim();
      details[key] = value;
    });
    bookDetails.bookDetails = details;

    // Extracting release label example
    const release = $('#ctl00_phBody_ProductDetail_lblRelease').text().replace(` | Released: `,"").trim();
    bookDetails.releaseLabel = release;

    // Extracting paragraphs example
    const aboutBookText = $('#aboutbook').text().replace('About the Book', '').trim();
    bookDetails.aboutBook = aboutBookText;

    // Extracting author details example
    const authorDetailDiv = $('.authordetailtext');
    const authors = [];
    authorDetailDiv.find('label').each((i, elem) => {
      const text = $(elem).text().trim().replace(`By: `,"");
      if (text) {
        const labelId = $(elem).attr('id');
        if (labelId.includes('lblAuthor') && !labelId.includes('Type')) {
          authors.push({ author: text });
        } else if (labelId.includes('lblAuthorType')) {
          const lastAuthor = authors[authors.length - 1];
          if (lastAuthor) {
            lastAuthor.role = text;
          }
        }
      }
    });
    bookDetails.authors = authors;

    // Checking availability example
    const availability = $('#ctl00_phBody_ProductDetail_lblAvailable').text().trim();
    bookDetails.isOutOfStock = availability === 'Out of Stock';

    res.json(bookDetails);
  } catch (error) {
    console.error('Error fetching HTML:', error);
    res.status(500).json({ error: 'Error fetching HTML.' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
