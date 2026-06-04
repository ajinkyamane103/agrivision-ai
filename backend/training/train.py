import torch
import torch.nn as nn
from torchvision import datasets, transforms
from torch.utils.data import DataLoader
from cnn import CNN

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print("Using Device:", device)

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.RandomHorizontalFlip(),
    transforms.RandomRotation(10),
    transforms.ColorJitter(
        brightness=0.2,
        contrast=0.2,
        saturation=0.2
    ),
    transforms.ToTensor()
])

# Dataset Paths
train_dataset = datasets.ImageFolder(
    "/content/data/train",
    transform=transform
)

valid_dataset = datasets.ImageFolder(
    "/content/data/valid",
    transform=transform
)

# Data Loaders
train_loader = DataLoader(
    train_dataset,
    batch_size=32,
    shuffle=True
)

valid_loader = DataLoader(
    valid_dataset,
    batch_size=32,
    shuffle=False
)

# Model
model = CNN(39)
model = model.to(device)

# Loss Function
criterion = nn.CrossEntropyLoss()

# Optimizer
optimizer = torch.optim.Adam(
    model.parameters(),
    lr=0.0001
)

epochs = 20

for epoch in range(epochs):

    model.train()

    running_loss = 0
    train_correct = 0
    train_total = 0

    for images, labels in train_loader:

        images = images.to(device)
        labels = labels.to(device)

        optimizer.zero_grad()

        outputs = model(images)

        _, predicted = torch.max(outputs, 1)

        train_total += labels.size(0)
        train_correct += (predicted == labels).sum().item()

        loss = criterion(outputs, labels)

        loss.backward()

        optimizer.step()

        running_loss += loss.item()

    train_accuracy = 100 * train_correct / train_total

    print(f"\nEpoch {epoch+1}/{epochs}")
    print(f"Loss: {running_loss:.4f}")
    print(f"Train Accuracy: {train_accuracy:.2f}%")

    # Validation
    model.eval()

    correct = 0
    total = 0

    with torch.no_grad():

        for images, labels in valid_loader:

            images = images.to(device)
            labels = labels.to(device)

            outputs = model(images)

            _, predicted = torch.max(outputs, 1)

            total += labels.size(0)
            correct += (predicted == labels).sum().item()

    validation_accuracy = 100 * correct / total

    print(f"Validation Accuracy: {validation_accuracy:.2f}%")

# Save Model
torch.save(
    model.state_dict(),
    "plant_disease_model_1_latest_new_collab_file.pt"
)

print("\nModel Saved Successfully!")