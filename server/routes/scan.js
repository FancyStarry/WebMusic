const express = require('express')
const scanner = require('../scanner')

const router = express.Router()

router.post('/', async (req, res) => {
  const result = await scanner.startScan(req.body.dirs)
  if (result.error) {
    return res.status(409).json(result)
  }
  res.json(result)
})

router.get('/status', (req, res) => {
  res.json(scanner.getScanStatus())
})

module.exports = router
