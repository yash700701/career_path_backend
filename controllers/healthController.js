/**
 * @desc    health check
 * @route   GET /api/health
 * @access  Public
 */
export const health = async (req, res) => {
  try {
    return res.json({
      message: 'Server is running...',
      running: true
    });
  } catch (error) {
    console.error('Error connecting with server', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
