cmake_minimum_required(VERSION 3.10)

project(Graphics-Editor)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

set(CMAKE_TOOLCHAIN_FILE "C:/project/C++/C++LIB/vcpkg/scripts/buildsystems/vcpkg.cmake" CACHE STRING "Vcpkg toolchain file")
set(CMAKE_PREFIX_PATH "${CMAKE_PREFIX_PATH};C:/project/C++/C++LIB/vcpkg/installed/x64-windows")

find_package(unofficial-skia CONFIG REQUIRED)

add_executable(Graphics-Editor main.cpp)

target_link_libraries(Graphics-Editor PRIVATE unofficial::skia::skia)