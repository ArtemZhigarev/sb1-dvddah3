import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertCircle, Package, ArrowUpDown, Search } from 'lucide-react';
import WooCommerceService, { WooCommerceServer } from '../services/woocommerce';
import ProductDetails from './ProductDetails';
import StoreSelector from './StoreSelector';

interface Product {
  id: number;
  name: string;
  price: string;
  regular_price: string;
  sale_price: string;
  status: string;
  stock_status: string;
  description: string;
  short_description: string;
  sku: string;
  permalink: string;
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
}

interface LoadingProgress {
  total: number;
  current: number;
  store: string;
}

const AllProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState('Initializing...');
  const [loadingProgress, setLoadingProgress] = useState<LoadingProgress>({ total: 0, current: 0, store: '' });
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [sortField, setSortField] = useState<'id' | 'name'>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [servers, setServers] = useState<WooCommerceServer[]>([]);
  const [selectedServers, setSelectedServers] = useState<string[]>([]);

  useEffect(() => {
    const allServers = WooCommerceService.getServers();
    setServers(allServers);
    setSelectedServers(allServers.filter(s => s.status === 'online').map(s => s.id));
  }, []);

  useEffect(() => {
    if (selectedServers.length > 0) {
      setProducts([]);
      setPage(1);
      fetchProducts();
    }
  }, [selectedServers]);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    setLoadingProgress({ total: selectedServers.length, current: 0, store: '' });

    try {
      setLoadingStatus('Connecting to stores...');
      const productPromises = selectedServers.map(async (serverId, index) => {
        const server = servers.find(s => s.id === serverId);
        if (!server) return [];

        try {
          setLoadingProgress(prev => ({
            ...prev,
            current: index,
            store: server.name
          }));
          setLoadingStatus(`Fetching products from ${server.name}...`);

          const response = await axios.get(`${server.url}/wp-json/wc/v3/products`, {
            auth: {
              username: server.consumerKey,
              password: server.consumerSecret
            },
            params: {
              per_page: 20,
              page: page,
              search: searchTerm
            }
          });

          return response.data.map((product: Product) => ({
            ...product,
            store: {
              id: server.id,
              name: server.name,
              url: server.url
            }
          }));
        } catch (error) {
          console.error(`Error fetching products from ${server.name}:`, error);
          return [];
        }
      });

      setLoadingStatus('Processing product data...');
      const allProductsArrays = await Promise.all(productPromises);
      const allProducts = allProductsArrays.flat();

      setProducts(prevProducts => {
        const newProducts = allProducts.filter((newProduct: Product) => 
          !prevProducts.some(existingProduct => 
            existingProduct.id === newProduct.id && existingProduct.store?.id === newProduct.store?.id
          )
        );
        return [...prevProducts, ...newProducts];
      });
      setHasMore(allProducts.length === selectedServers.length * 20);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setLoading(false);
    }
  };

  const handleSort = (field: 'id' | 'name') => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setProducts([]);
    setPage(1);
    fetchProducts();
  };

  const sortedProducts = [...products].sort((a, b) => {
    const direction = sortDirection === 'asc' ? 1 : -1;
    if (sortField === 'id') {
      return (a.id - b.id) * direction;
    } else {
      return a.name.localeCompare(b.name) * direction;
    }
  });

  const getProgressPercentage = () => {
    if (loadingProgress.total === 0) return 0;
    return Math.round((loadingProgress.current / loadingProgress.total) * 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-800">All Products</h1>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <form onSubmit={handleSearch} className="flex-1 sm:flex-initial">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </form>
          <div className="flex space-x-2">
            <button
              onClick={() => handleSort('id')}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                sortField === 'id' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'
              } hover:bg-blue-50`}
            >
              ID
              <ArrowUpDown className={`ml-1 h-4 w-4 ${sortField === 'id' ? 'text-blue-800' : 'text-gray-500'}`} />
            </button>
            <button
              onClick={() => handleSort('name')}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                sortField === 'name' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'
              } hover:bg-blue-50`}
            >
              Name
              <ArrowUpDown className={`ml-1 h-4 w-4 ${sortField === 'name' ? 'text-blue-800' : 'text-gray-500'}`} />
            </button>
          </div>
        </div>
      </div>

      <StoreSelector
        servers={servers}
        selectedServers={selectedServers}
        onSelectionChange={setSelectedServers}
      />

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
          <div className="flex">
            <AlertCircle className="h-6 w-6 text-red-500 mr-4" />
            <div>
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-full max-w-sm bg-white rounded-lg shadow-md p-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>
              <div className="flex items-center justify-between w-full text-sm text-gray-500">
                <span>{loadingStatus}</span>
                <span>{getProgressPercentage()}%</span>
              </div>
              {loadingProgress.store && (
                <p className="text-sm text-gray-600">
                  Store: {loadingProgress.store} ({loadingProgress.current + 1} of {loadingProgress.total})
                </p>
              )}
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedProducts.map((product) => (
          <div
            key={`${product.store?.id}-${product.id}`}
            onClick={() => setSelectedProduct(product)}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer"
          >
            <div className="aspect-w-16 aspect-h-9 bg-gray-200">
              {product.images?.[0]?.src && (
                <img
                  src={product.images[0].src}
                  alt={product.images[0].alt || product.name}
                  className="object-cover w-full h-full"
                />
              )}
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-800 truncate">{product.name}</h3>
                <Package className="h-5 w-5 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.short_description}</p>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-lg font-bold text-gray-900">${product.price}</span>
                  {product.regular_price !== product.price && (
                    <span className="ml-2 text-sm text-gray-500 line-through">
                      ${product.regular_price}
                    </span>
                  )}
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  product.stock_status === 'instock'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {product.stock_status}
                </span>
              </div>
              {product.store && (
                <div className="mt-2 text-xs text-gray-500">
                  Store: {product.store.name}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {hasMore && !loading && products.length > 0 && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => setPage(prevPage => prevPage + 1)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Load More
          </button>
        </div>
      )}

      {!loading && sortedProducts.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {searchTerm ? 'No products found matching your search criteria.' : selectedServers.length === 0 ? 'Please select at least one store to view products.' : 'No products found.'}
        </div>
      )}

      {selectedProduct && (
        <ProductDetails
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
};

export default AllProducts;