const asyncHandler = require('express-async-handler');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

// Trim video
const trimVideo = asyncHandler(async (req, res) => {
  const { videoPath, startTime, duration } = req.body;

  if (!videoPath || !startTime || !duration) {
    return res.status(400).json({
      success: false,
      message: 'Video path, start time, and duration are required'
    });
  }

  const inputPath = path.join(__dirname, '../../vdeos', videoPath);
  const outputPath = path.join(__dirname, '../../vdeos', `trimmed_${Date.now()}_${videoPath}`);

  const command = `ffmpeg -i "${inputPath}" -ss ${startTime} -t ${duration} -c copy "${outputPath}"`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      logger.error('FFmpeg trim error:', error);
      return res.status(500).json({
        success: false,
        message: 'Video trimming failed'
      });
    }

    res.json({
      success: true,
      message: 'Video trimmed successfully',
      outputPath: `trimmed_${Date.now()}_${videoPath}`
    });
  });
});

// Add text overlay
const addTextOverlay = asyncHandler(async (req, res) => {
  const { videoPath, text, position, fontSize, color } = req.body;

  if (!videoPath || !text) {
    return res.status(400).json({
      success: false,
      message: 'Video path and text are required'
    });
  }

  const inputPath = path.join(__dirname, '../../vdeos', videoPath);
  const outputPath = path.join(__dirname, '../../vdeos', `text_${Date.now()}_${videoPath}`);

  const pos = position || 'center';
  const size = fontSize || 24;
  const col = color || 'white';

  const command = `ffmpeg -i "${inputPath}" -vf "drawtext=text='${text}':fontcolor=${col}:fontsize=${size}:x=(w-text_w)/2:y=(h-text_h)/2" -c:a copy "${outputPath}"`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      logger.error('FFmpeg text overlay error:', error);
      return res.status(500).json({
        success: false,
        message: 'Text overlay failed'
      });
    }

    res.json({
      success: true,
      message: 'Text overlay added successfully',
      outputPath: `text_${Date.now()}_${videoPath}`
    });
  });
});

// Apply filter
const applyFilter = asyncHandler(async (req, res) => {
  const { videoPath, filter } = req.body;

  if (!videoPath || !filter) {
    return res.status(400).json({
      success: false,
      message: 'Video path and filter are required'
    });
  }

  const inputPath = path.join(__dirname, '../../vdeos', videoPath);
  const outputPath = path.join(__dirname, '../../vdeos', `filter_${Date.now()}_${videoPath}`);

  let filterCommand = '';
  switch (filter) {
    case 'grayscale':
      filterCommand = '-vf colorchannelmixer=.3:.4:.3:.3:.4:.3:.3:.4:.3';
      break;
    case 'sepia':
      filterCommand = '-vf colorchannelmixer=.393:.769:.189:.349:.686:.168:.272:.534:.131';
      break;
    case 'brightness':
      filterCommand = '-vf eq=brightness=0.1';
      break;
    default:
      return res.status(400).json({
        success: false,
        message: 'Invalid filter type'
      });
  }

  const command = `ffmpeg -i "${inputPath}" ${filterCommand} "${outputPath}"`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      logger.error('FFmpeg filter error:', error);
      return res.status(500).json({
        success: false,
        message: 'Filter application failed'
      });
    }

    res.json({
      success: true,
      message: 'Filter applied successfully',
      outputPath: `filter_${Date.now()}_${videoPath}`
    });
  });
});

module.exports = {
  trimVideo,
  addTextOverlay,
  applyFilter
};
