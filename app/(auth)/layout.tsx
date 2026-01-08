import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-sand/30 flex flex-col">
       {/* Background Texture */}
       <div 
        className="fixed inset-0 pointer-events-none opacity-50 z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 800 800'%3E%3Cg fill='none' stroke='%23C4B5A4' stroke-width='1'%3E%3Cpath d='M769 229L1037 260.9M927 880L731 737 520 660 309 538 40 599 295 764 126 598 79 416 95 321 27 246 769 229 927 880'/%3E%3Cpath d='M-169 529L137 560.9M27 1180L-169 1037-380 960-591 838-860 899-605 1064-774 898-821 716-805 621-873 546-169 529 27 1180'/%3E%3Cpath d='M769 1429L1037 1460.9M927 2080L731 1937 520 1860 309 1738 40 1799 295 1964 126 1798 79 1616 95 1521 27 1446 769 1429 927 2080'/%3E%3Cpath d='M-169 1429L137 1460.9M27 2080L-169 1937-380 1860-591 1738-860 1799-605 1964-774 1798-821 1616-805 1521-873 1446-169 1429 27 2080'/%3E%3Cpath d='M769-971L1037-939.1M927-320L731-463 520-540 309-662 40-601 295-436 126-602 79-784 95-879 27-954 769-971 927-320'/%3E%3Cpath d='M-169-971L137-939.1M27-320L-169-463-380-540-591-662-860-601-605-436-774-602-821-784-805-879-873-954-169-971 27-320'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      
      <Header />
      
      <main className="flex-1 flex items-center justify-center p-4 pt-24 pb-12 relative z-10">
        {children}
      </main>

      <Footer />
    </div>
  );
}
