import Category from '../models/Category.js';

export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Category name required' });

    // Prevent duplicate for same user
    const exists = await Category.findOne({ name: name.trim(), owner: req.user.userId });
    if (exists) return res.status(400).json({ message: 'Category already exists' });

    const category = new Category({ name: name.trim(), owner: req.user.userId });
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ message: 'Could not create category', error: err.message });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ owner: req.user.userId }).sort('name').lean();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Could not fetch categories', error: err.message });
  }
};