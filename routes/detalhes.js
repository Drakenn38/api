const express = require('express');
const router = express.Router();
const axios = require('axios');

const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36';
const baseImageUrl = 'https://cdn.atv2.net/img/';

function createSlug(name) {
  name = name.replace(/ão/g, 'cao');

  return name
    .toLowerCase()
    .replace(/[áàâãä]/g, 'a')
    .replace(/[éèêë]/g, 'e')
    .replace(/[íìîï]/g, 'i')
    .replace(/[óòôõö]/g, 'o')
    .replace(/[úùûü]/g, 'u')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim();
}

router.get('/detalhes/:id', async (req, res) => {
  const itemId = Number(req.params.id);

  if (isNaN(itemId)) {
    return res.status(400).json({ error: 'Parâmetro id inválido' });
  }

  const apiUrl = `https://animeland.atv2.net/videoweb/api.php?action=viewcategory&categoryid=${itemId}`;

  try {
    const response = await axios.get(apiUrl, { headers: { 'User-Agent': userAgent }, timeout: 5000 });

    if (response.status === 200) {
      const data = response.data;

      data.forEach(item => {
        if (item.category_icon) {
          item.category_icon = baseImageUrl + item.category_icon;
        }
      });
      if (Array.isArray(data) && data.length > 0) {
        const genres = data[0].genres.split(',').map(genre => {
          return {
            name: genre.trim(),
            slug: createSlug(genre.trim())
          };
        });

        data[0].genres = genres;

        res.json(data[0]);
      } else {
        res.status(404).json({ error: 'Dados não encontrados' });
      }
    } else {
      res.status(response.status).json({ error: `Erro na solicitação: ${response.status}` });
    }
  } catch (error) {
    console.error('Erro na requisição:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
