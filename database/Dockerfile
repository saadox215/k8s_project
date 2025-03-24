# Utiliser l'image officielle de MySQL
FROM mysql:5.7

# Définir les variables d'environnement pour MySQL
ENV MYSQL_ROOT_PASSWORD=rootpassword
ENV MYSQL_DATABASE=db_ramadane
ENV MYSQL_USER=saad
ENV MYSQL_PASSWORD=1234

# Copier le script SQL pour initialiser la base de données
COPY init.sql /docker-entrypoint-initdb.d/

# Exposer le port MySQL
EXPOSE 3306