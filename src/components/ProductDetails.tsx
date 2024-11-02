import React from 'react';
import { X, Package, Tag, ShoppingCart, AlertCircle, Link as LinkIcon, DollarSign, Archive, Clock, BarChart } from 'lucide-react';

interface ProductDetailsProps {
  product: {
    id: number;
    name: string;
    permalink: string;
    price: string;
    regular_price: string;
    sale_price: string;
    status: string;
    stock_status: string;
    description: string;
    short_description: string;
    sku: string;
    categories: Array<{
      id: number;
      name: string;
    }>;
    images: Array<{
      id: number;
      src: string;
      alt: string;
    }>;
    store?: {
      id: string;
      name: string;
      url: string;
    };
    attributes?: Array<{
      id: number;
      name: string;
      options: string[];
    }>;
  };
  onClose: () => void;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ product, onClose }) => {
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getProductUrl = () => {
    if (product.permalink && product.store?.url) {
      return product.permalink.startsWith('http') 
        ? product.permalink 
        : `${product.store.url.replace(/\/$/, '')}/${product.permalink.replace(/^\//, '')}`;
    }
    return null;
  };

  const productUrl = getProductUrl();
  const isOnSale = product.sale_price && product.sale_price !== product.regular_price;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center overflow-y-auto p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl my-8">
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-lg border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold text-gray-800">{product.name}</h2>
            {productUrl && (
              <a
                href={productUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
              >
                <LinkIcon className="w-4 h-4 mr-1" />
                View in Store
              </a>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {/* Product Images and Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Images */}
            <div className="space-y-4">
              {product.images && product.images.length > 0 ? (
                <div className="aspect-w-1 aspect-h-1 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={product.images[0].src}
                    alt={product.images[0].alt || product.name}
                    className="object-cover w-full h-full"
                  />
                </div>
              ) : (
                <div className="aspect-w-1 aspect-h-1 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Package className="w-20 h-20 text-gray-400" />
                </div>
              )}
              {/* Thumbnail Grid */}
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.slice(1).map((image) => (
                    <div key={image.id} className="aspect-w-1 aspect-h-1 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={image.src}
                        alt={image.alt || ''}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Price Section */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-gray-500" />
                  <div>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-2xl font-bold text-gray-900">
                        ${isOnSale ? product.sale_price : product.regular_price}
                      </span>
                      {isOnSale && (
                        <span className="text-lg text-gray-500 line-through">
                          ${product.regular_price}
                        </span>
                      )}
                    </div>
                    {isOnSale && (
                      <span className="text-sm text-green-600">
                        Sale Price
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Stock Status */}
              <div className="flex items-center space-x-2">
                <Archive className="w-5 h-5 text-gray-500" />
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  product.stock_status === 'instock'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {product.stock_status === 'instock' ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>

              {/* Categories */}
              {product.categories && product.categories.length > 0 && (
                <div className="flex items-start space-x-2">
                  <Tag className="w-5 h-5 text-gray-500 mt-1" />
                  <div className="flex flex-wrap gap-2">
                    {product.categories.map((category) => (
                      <span
                        key={category.id}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {category.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* SKU */}
              {product.sku && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <BarChart className="w-5 h-5 text-gray-500" />
                  <span>SKU: {product.sku}</span>
                </div>
              )}

              {/* Store Info */}
              {product.store && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <ShoppingCart className="w-5 h-5 text-gray-500" />
                  <span>Store: {product.store.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Description Sections */}
          <div className="space-y-6">
            {/* Short Description */}
            {product.short_description && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Quick Overview</h3>
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: product.short_description }}
                />
              </div>
            )}

            {/* Full Description */}
            {product.description && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Product Description</h3>
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </div>
            )}

            {/* Attributes */}
            {product.attributes && product.attributes.length > 0 && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {product.attributes.map((attribute) => (
                    <div key={attribute.id} className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-700">{attribute.name}</h4>
                      <div className="mt-1 text-sm text-gray-600">
                        {attribute.options.join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 rounded-b-lg">
          <div className="flex justify-end space-x-4">
            {productUrl && (
              <a
                href={productUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                View in Store
              </a>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;