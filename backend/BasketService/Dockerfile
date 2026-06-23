FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["BasketService/BasketService.csproj", "BasketService/"]
RUN dotnet restore "BasketService/BasketService.csproj"

COPY . .
WORKDIR "/src/BasketService"
RUN dotnet publish "BasketService.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "BasketService.dll"]