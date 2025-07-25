import Product from "../models/product.model.js";


export const getProducts = async (req, res) => {
    try {
        const products = await Product.find({}); // find all products
        if (products.length === 0) {
            return res.status(404).json({ success: false, message: "No products found." });
        }
        res.status(200).json({ success: true, count: products.length, data: products });
    } catch (error) {
        console.error("Error fetching products:", error.message);
        res.status(500).json({ success: false, message: "Server Error: " + error.message });
    }
};

export const createProduct = async (req, res) => {
    const product = req.body; //user will send this data

    if(!product.name || !product.price || !product.image) {
        return res.status(400).json({ success:false, message: "Please, provide all fields"});
    }

    const newProduct = new Product(product)

    try {
        await newProduct.save();
        res.status(201).json({ success: true, data: newProduct});
    } catch (error) {
        console.error("Error in create product:", error.message);
        res.status(500).json({ success: false, message: "Server Error"});
    }
};

export const updateProduct = async (req, res) => {
    const productId = req.params.id;
    const { name, price, image } = req.body; // Destructure fields from the request body

    // Basic validation for update fields
    if (!name || !price || !image) {
        return res.status(400).json({ success: false, message: "Please, provide all fields (name, price, image) for update." });
    }

    try {
        // findByIdAndUpdate(id, update, options)
        // { new: true } returns the document *after* update was applied.
        // { runValidators: true } runs schema validators on the update operation.
        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            { name, price, image },
            { new: true, runValidators: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ success: false, message: "Product not found." });
        }

        res.status(200).json({ success: true, message: "Product updated successfully.", data: updatedProduct });
    } catch (error) {
        console.error("Error updating product:", error.message);
        if (error.name === 'CastError') {
             return res.status(400).json({ success: false, message: "Invalid product ID format." });
        }
        if (error.code === 11000) { // MongoDB duplicate key error code
            return res.status(409).json({ success: false, message: "Product with this name already exists." });
        }
        res.status(500).json({ success: false, message: "Server Error: " + error.message });
    }
}; 

export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            // If product is null, it means no document was found and deleted
            return res.status(404).json({ success: false, message: "Product not found." });
        }
        res.status(200).json({ success: true, message: "Product deleted successfully.", data: product });
    } catch (error) {
        console.error("Error deleting product:", error.message);
         if (error.name === 'CastError') {
             return res.status(400).json({ success: false, message: "Invalid product ID format." });
        }
        res.status(500).json({ success: false, message: "Server Error: " + error.message });
    }
};