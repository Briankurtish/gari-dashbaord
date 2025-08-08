"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Pencil,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Settings2,
  ExternalLink,
  Upload,
  Plus,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface BikeImage {
  id: number;
  image_url: string;
  is_primary: boolean;
}

interface Bike {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  stock_quantity: number;
  primary_image: {
    image_url: string;
  };
  images: BikeImage[];
  specifications: string;
  features: string;
  created_at: string;
  updated_at: string;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.gari-mobility.tech";

export default function EBikesPage() {
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBike, setSelectedBike] = useState<Bike | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [editingBike, setEditingBike] = useState<Bike | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<BikeImage[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewingBike, setViewingBike] = useState<Bike | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newBike, setNewBike] = useState<{
    name: string;
    description: string;
    price: number;
    category: string;
    stock_quantity: number;
    specifications: string;
    features: string;
  }>({
    name: "",
    description: "",
    price: 0,
    category: "",
    stock_quantity: 0,
    specifications: "",
    features: "",
  });
  const [newBikeImages, setNewBikeImages] = useState<File[]>([]);
  const [newBikeImagePreviews, setNewBikeImagePreviews] = useState<string[]>(
    []
  );
  const [selectedCurrency, setSelectedCurrency] = useState<"KES" | "XAF">(
    "KES"
  );

  // Currency conversion rates (you might want to fetch these from an API)
  const KES_TO_XAF_RATE = 1.5; // Example rate, replace with actual rate

  // Convert KES to XAF
  const kesToXaf = (kes: number) => Math.round(kes * KES_TO_XAF_RATE);

  // Convert XAF to KES
  const xafToKes = (xaf: number) => Math.round(xaf / KES_TO_XAF_RATE);

  const formatCurrency = (amount: number, currency: "KES" | "XAF") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Update the price input handlers
  const handlePriceChange = (
    value: string,
    isKES: boolean,
    setPrice: (price: number) => void
  ) => {
    const numericValue = value === "" ? 0 : parseInt(value);
    // Always store in KES
    setPrice(isKES ? numericValue : xafToKes(numericValue));
  };

  // Get the display value for the input field
  const getDisplayPrice = (price: number, isKES: boolean) => {
    if (!price) return "";
    return isKES ? price.toString() : kesToXaf(price).toString();
  };

  // Get the formatted price for display in cards and dialogs
  const getFormattedPrice = (price: number, isKES: boolean) => {
    if (!price) return "";
    return formatCurrency(
      isKES ? price : kesToXaf(price),
      isKES ? "KES" : "XAF"
    );
  };

  // Get the conversion display (shows the opposite currency)
  const getConversionDisplay = (price: number, isKES: boolean) => {
    if (!price) return "";
    const oppositeAmount = isKES ? kesToXaf(price) : xafToKes(price);
    const formattedAmount = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(oppositeAmount);

    return isKES ? `${formattedAmount} XAF` : `KES ${formattedAmount}`;
  };

  useEffect(() => {
    fetchBikes();
  }, []);

  const getAuthHeaders = () => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    console.log("Token from storage:", token);

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    if (token) {
      headers.Authorization = `Token ${token}`;
    }

    return headers;
  };

  const fetchBikes = async () => {
    try {
      setLoading(true);
      setError(null);
      const headers = getAuthHeaders();
      if (!headers) return;

      const response = await fetch(`${API_BASE_URL}/api/v1/products/`, {
        method: "GET",
        headers,
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError("Authentication failed. Please check your login status.");
          return;
        }
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.detail || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      setBikes(data.results);
    } catch (error) {
      console.error("Error fetching bikes:", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch bikes"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setNewImages((prev) => [...prev, ...files]);

    // Create previews for new images
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleRemoveNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = (imageId: number) => {
    setImagesToDelete((prev) => [...prev, imageId]);
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  const handleSaveBike = async () => {
    if (!editingBike) return;

    try {
      setIsLoading(true);
      setError(null);

      const formData = new FormData();

      // Add basic bike information
      formData.append("name", editingBike.name);
      formData.append("description", editingBike.description);
      formData.append("price", editingBike.price.toString());
      formData.append("category", editingBike.category);
      formData.append("stock_quantity", editingBike.stock_quantity.toString());

      // Add new images
      newImages.forEach((file, index) => {
        formData.append("images", file);
        if (index === 0) {
          formData.append("is_primary", "true");
        }
      });

      // Add images to delete
      imagesToDelete.forEach((id) => {
        formData.append("images_to_delete", id.toString());
      });

      const authHeaders = getAuthHeaders();
      const headers: HeadersInit = {
        Authorization: authHeaders.Authorization || "",
      };

      const response = await fetch(
        `${API_BASE_URL}/api/v1/products/${editingBike.id}/`,
        {
          method: "PUT",
          headers,
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response body:", errorText);

        let errorMessage = "Failed to update bike";
        try {
          const errorData = JSON.parse(errorText);
          console.error("Parsed error data:", errorData);
          errorMessage =
            errorData.detail || errorData.message || JSON.stringify(errorData);
        } catch (e) {
          console.error("Error parsing error response:", e);
        }

        throw new Error(errorMessage);
      }

      const updatedBike = await response.json();
      console.log("Bike updated successfully:", updatedBike);

      // Optimistically update the UI
      setBikes((prevBikes) =>
        prevBikes.map((bike) =>
          bike.id === updatedBike.id ? updatedBike : bike
        )
      );

      // Close the dialog and reset states
      setIsEditDialogOpen(false);
      setEditingBike(null);
      setNewImages([]);
      setImagePreviews([]);
      setExistingImages([]);
      setImagesToDelete([]);

      // Refresh the data to ensure consistency
      await fetchBikes();
    } catch (err) {
      console.error("Error updating bike:", err);
      setError(err instanceof Error ? err.message : "Failed to update bike");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBike = async () => {
    if (!selectedBike) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `${API_BASE_URL}/api/v1/products/${selectedBike.id}/`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete bike");
      }

      // Optimistically update the UI
      setBikes((prevBikes) =>
        prevBikes.filter((bike) => bike.id !== selectedBike.id)
      );

      // Close the dialog and reset state
      setIsDeleteDialogOpen(false);
      setSelectedBike(null);

      // Refresh the data to ensure consistency
      await fetchBikes();
    } catch (err) {
      console.error("Error deleting bike:", err);
      setError(err instanceof Error ? err.message : "Failed to delete bike");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBikes = bikes.filter((bike) => {
    const matchesSearch = bike.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handlePreviousImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? (viewingBike?.images.length || 1) - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === (viewingBike?.images.length || 1) - 1 ? 0 : prev + 1
    );
  };

  const handleNewBikeImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setNewBikeImages((prev) => [...prev, ...files]);

      // Create previews
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setNewBikeImagePreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveNewBikeImage = (index: number) => {
    setNewBikeImages((prev) => prev.filter((_, i) => i !== index));
    setNewBikeImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddBike = async () => {
    try {
      const formData = new FormData();
      formData.append("name", newBike.name);
      formData.append("description", newBike.description);
      formData.append("price", newBike.price.toString());
      formData.append("stock_quantity", newBike.stock_quantity.toString());
      formData.append("category", newBike.category);
      formData.append("specifications", newBike.specifications);
      formData.append("features", newBike.features);

      // Append each image file
      newBikeImages.forEach((file) => {
        formData.append("images", file);
      });

      const response = await fetch(`${API_BASE_URL}/api/v1/products/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to add bike");
      }

      const data = await response.json();
      setBikes((prevBikes) => [...prevBikes, data]);
      setIsAddDialogOpen(false);
      setNewBike({
        name: "",
        description: "",
        price: 0,
        stock_quantity: 0,
        category: "",
        specifications: "",
        features: "",
      });
      setNewBikeImages([]);
      setNewBikeImagePreviews([]);
    } catch (error) {
      console.error("Error adding bike:", error);
      throw error;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">E-Bikes</h1>
        <div className="flex items-center gap-4">
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add New Bike
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>E-Bike Management</CardTitle>
          <CardDescription>
            View and manage all e-bikes in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search e-bikes..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">Loading bikes...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBikes.map((bike) => (
                <Card key={bike.id} className="overflow-hidden">
                  <div className="relative">
                    <img
                      src={
                        bike.primary_image?.image_url || "/placeholder-bike.jpg"
                      }
                      alt={bike.name}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle>{bike.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {bike.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Price:</span>
                        <span className="text-lg font-bold">
                          {getFormattedPrice(
                            bike.price,
                            selectedCurrency === "KES"
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Stock:</span>
                        <span className="text-sm">{bike.stock_quantity}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2 pt-4">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              setViewingBike(bike);
                              setIsViewDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>View Details</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              setEditingBike(bike);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Edit Bike</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="destructive"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              setSelectedBike(bike);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Delete Bike</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Bike</DialogTitle>
            <DialogDescription>
              Make changes to the bike details
            </DialogDescription>
          </DialogHeader>
          {editingBike && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={editingBike.name}
                  onChange={(e) =>
                    setEditingBike({ ...editingBike, name: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={editingBike.description}
                  onChange={(e) =>
                    setEditingBike({
                      ...editingBike,
                      description: e.target.value,
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">
                  Price
                </Label>
                <div className="col-span-3 space-y-2">
                  <div className="flex gap-2">
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="1"
                      value={getDisplayPrice(
                        editingBike.price,
                        selectedCurrency === "KES"
                      )}
                      onChange={(e) =>
                        handlePriceChange(
                          e.target.value,
                          selectedCurrency === "KES",
                          (price) => setEditingBike({ ...editingBike, price })
                        )
                      }
                      className="flex-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <Select
                      value={selectedCurrency}
                      onValueChange={(value: "KES" | "XAF") =>
                        setSelectedCurrency(value)
                      }
                    >
                      <SelectTrigger className="w-[100px]">
                        <SelectValue placeholder="Currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="KES">KES</SelectItem>
                        <SelectItem value="XAF">XAF</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {getConversionDisplay(
                      editingBike.price,
                      selectedCurrency === "KES"
                    )}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category
                </Label>
                <Select
                  value={editingBike.category}
                  onValueChange={(value) =>
                    setEditingBike({ ...editingBike, category: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="electric">Electric</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="stock" className="text-right">
                  Stock
                </Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  step="1"
                  value={editingBike.stock_quantity || ""}
                  onChange={(e) =>
                    setEditingBike({
                      ...editingBike,
                      stock_quantity:
                        e.target.value === "" ? 0 : parseInt(e.target.value),
                    })
                  }
                  className="flex-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-medium">Images</h4>

                {/* Image Upload */}
                <div className="space-y-4">
                  <div
                    className="border-2 border-dashed rounded-lg p-6 hover:border-primary/50 transition-colors cursor-pointer relative"
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      e.currentTarget.classList.add("border-primary");
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      e.currentTarget.classList.remove("border-primary");
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      e.currentTarget.classList.remove("border-primary");
                      const files = Array.from(e.dataTransfer.files).filter(
                        (file) => file.type.startsWith("image/")
                      );
                      if (files.length > 0) {
                        handleImageChange({ target: { files } } as any);
                      }
                    }}
                    onClick={() =>
                      document.getElementById("file-upload")?.click()
                    }
                  >
                    <input
                      id="file-upload"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <div className="flex flex-col items-center justify-center gap-2 text-center">
                      <div className="p-3 rounded-full bg-primary/10">
                        <Upload className="h-6 w-6 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG, GIF up to 10MB
                        </p>
                      </div>
                    </div>
                  </div>

                  {imagePreviews.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        New Images
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={preview}
                              alt="New bike"
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <Button
                              variant="destructive"
                              size="icon"
                              className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleRemoveNewImage(index)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                            {index === 0 && (
                              <div className="absolute bottom-1 left-1 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded">
                                Will be Primary
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {editingBike.images && editingBike.images.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Current Images
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {editingBike.images.map((image) => (
                          <div key={image.id} className="relative group">
                            <img
                              src={image.image_url}
                              alt="Bike"
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <Button
                              variant="destructive"
                              size="icon"
                              className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() =>
                                handleRemoveExistingImage(image.id)
                              }
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                            {image.is_primary && (
                              <div className="absolute bottom-1 left-1 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded">
                                Primary
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveBike} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Bike</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this bike? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteBike}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Bike Details</DialogTitle>
            <DialogDescription>
              View complete details of the bike
            </DialogDescription>
          </DialogHeader>
          {viewingBike && (
            <div className="grid gap-6">
              <div className="relative w-full max-h-[400px] group">
                <div className="w-full h-full flex items-center justify-center bg-muted/20 rounded-lg overflow-hidden">
                  <img
                    src={
                      viewingBike.images[currentImageIndex]?.image_url ||
                      viewingBike.primary_image?.image_url ||
                      "/placeholder-bike.jpg"
                    }
                    alt={viewingBike.name}
                    className="max-w-full max-h-[400px] w-auto h-auto object-contain"
                  />
                </div>
                {viewingBike.images.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={handlePreviousImage}
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={handleNextImage}
                    >
                      <ChevronRight className="h-6 w-6" />
                    </Button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                      {viewingBike.images.map((_, index) => (
                        <div
                          key={index}
                          className={`w-2 h-2 rounded-full ${
                            index === currentImageIndex
                              ? "bg-white"
                              : "bg-white/50"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="grid gap-6">
                <div>
                  <h3 className="text-2xl font-semibold">{viewingBike.name}</h3>
                  <p className="text-muted-foreground mt-2">
                    {viewingBike.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">
                        Price
                      </h4>
                      <p className="text-xl font-bold">
                        {getFormattedPrice(
                          viewingBike.price,
                          selectedCurrency === "KES"
                        )}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">
                        Stock
                      </h4>
                      <p className="text-lg">{viewingBike.stock_quantity}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">
                        Category
                      </h4>
                      <p className="text-lg capitalize">
                        {viewingBike.category}
                      </p>
                    </div>
                  </div>

                  {viewingBike.specifications &&
                    Object.keys(viewingBike.specifications).length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">
                          Specifications
                        </h4>
                        <div className="space-y-2">
                          {Object.entries(viewingBike.specifications).map(
                            ([key, value]) => (
                              <div key={key} className="flex justify-between">
                                <span className="text-sm capitalize">
                                  {key.replace(/_/g, " ")}
                                </span>
                                <span className="text-sm font-medium">
                                  {value}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </div>

                {viewingBike.features && viewingBike.features.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">
                      Features
                    </h4>
                    <ul className="list-disc list-inside space-y-1">
                      {viewingBike.features.map((feature, index) => (
                        <li key={index} className="text-sm">
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="text-sm text-muted-foreground">
                  <p>
                    Last updated:{" "}
                    {new Date(viewingBike.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsViewDialogOpen(false);
                setCurrentImageIndex(0);
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Bike</DialogTitle>
            <DialogDescription>
              Enter the details for the new bike
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-name" className="text-right">
                Name
              </Label>
              <Input
                id="new-name"
                value={newBike.name}
                onChange={(e) =>
                  setNewBike({ ...newBike, name: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-description" className="text-right">
                Description
              </Label>
              <Textarea
                id="new-description"
                value={newBike.description}
                onChange={(e) =>
                  setNewBike({ ...newBike, description: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-price" className="text-right">
                Price
              </Label>
              <div className="col-span-3 space-y-2">
                <div className="flex gap-2">
                  <Input
                    id="new-price"
                    type="number"
                    min="0"
                    step="1"
                    value={getDisplayPrice(
                      newBike.price,
                      selectedCurrency === "KES"
                    )}
                    onChange={(e) =>
                      handlePriceChange(
                        e.target.value,
                        selectedCurrency === "KES",
                        (price) => setNewBike({ ...newBike, price })
                      )
                    }
                    className="flex-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <Select
                    value={selectedCurrency}
                    onValueChange={(value: "KES" | "XAF") =>
                      setSelectedCurrency(value)
                    }
                  >
                    <SelectTrigger className="w-[100px]">
                      <SelectValue placeholder="Currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KES">KES</SelectItem>
                      <SelectItem value="XAF">XAF</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-sm text-muted-foreground">
                  {getConversionDisplay(
                    newBike.price,
                    selectedCurrency === "KES"
                  )}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-category" className="text-right">
                Category
              </Label>
              <Select
                value={newBike.category}
                onValueChange={(value) =>
                  setNewBike({ ...newBike, category: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="electric">Electric</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-stock" className="text-right">
                Stock
              </Label>
              <Input
                id="new-stock"
                type="number"
                min="0"
                step="1"
                value={newBike.stock_quantity || ""}
                onChange={(e) =>
                  setNewBike({
                    ...newBike,
                    stock_quantity:
                      e.target.value === "" ? 0 : parseInt(e.target.value),
                  })
                }
                className="flex-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-medium">Images</h4>

              {/* Image Upload */}
              <div
                className="border-2 border-dashed rounded-lg p-6 hover:border-primary/50 transition-colors cursor-pointer relative"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.currentTarget.classList.add("border-primary");
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.currentTarget.classList.remove("border-primary");
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.currentTarget.classList.remove("border-primary");
                  const files = Array.from(e.dataTransfer.files).filter(
                    (file) => file.type.startsWith("image/")
                  );
                  if (files.length > 0) {
                    handleNewBikeImageChange({ target: { files } } as any);
                  }
                }}
                onClick={() =>
                  document.getElementById("new-file-upload")?.click()
                }
              >
                <input
                  id="new-file-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleNewBikeImageChange}
                  className="hidden"
                />
                <div className="flex flex-col items-center justify-center gap-2 text-center">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Upload className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Image Previews */}
              {newBikeImagePreviews.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Selected Images
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {newBikeImagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt="New bike"
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveNewBikeImage(index)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                        {index === 0 && (
                          <div className="absolute bottom-1 left-1 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded">
                            Will be Primary
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddBike} disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Bike"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
