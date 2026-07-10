import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Auth from './pages/Auth';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Payment from './pages/Payment';
import Orders from './pages/Orders';
import { api } from './api';

export default function App() {
  const [tab, setTab] = useState('products');
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [paymentOrder, setPaymentOrder] = useState(null);
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  // Load auth state on launch
  useEffect(() => {
    const activeUser = api.getCurrentUser();
    if (activeUser) {
      setUser(activeUser);
      updateCartCount();
    }
  }, []);

  // Update cart count badge
  const updateCartCount = async () => {
    try {
      const cart = await api.getCart(4); // Default customer ID = 4
      const count = cart.items ? cart.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
      setCartCount(count);
    } catch (e) {
      console.error('Failed to sync cart count badge');
    }
  };

  const handleLoginSuccess = (userData) => {
    setUser({ email: userData.email, roles: userData.roles });
    setTab('products');
    updateCartCount();
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    setCartCount(0);
    setTab('products');
  };

  const renderContent = () => {
    switch (tab) {
      case 'auth':
        return <Auth onLoginSuccess={handleLoginSuccess} setTab={setTab} />;
      case 'products':
        return (
          <Products
            setTab={setTab}
            setSelectedProductId={setSelectedProductId}
          />
        );
      case 'product-detail':
        return (
          <ProductDetail
            productId={selectedProductId}
            user={user}
            setTab={setTab}
            onAddToCart={updateCartCount}
          />
        );
      case 'cart':
        return (
          <Cart
            setTab={setTab}
            onCartChange={updateCartCount}
          />
        );
      case 'checkout':
        return (
          <Checkout
            setTab={setTab}
            onCheckoutSuccess={(order) => {
              setPaymentOrder(order);
              setTab('payment');
              updateCartCount();
            }}
          />
        );
      case 'payment':
        return <Payment order={paymentOrder} setTab={setTab} />;
      case 'orders':
        return (
          <Orders
            setTab={setTab}
            setPaymentOrder={setPaymentOrder}
          />
        );
      default:
        return <Products setTab={setTab} setSelectedProductId={setSelectedProductId} />;
    }
  };

  return (
    <div className="app-container">
      <Navbar
        currentTab={tab}
        setTab={setTab}
        user={user}
        onLogout={handleLogout}
        cartCount={cartCount}
      />

      <main className="content">
        {renderContent()}
      </main>
    </div>
  );
}
